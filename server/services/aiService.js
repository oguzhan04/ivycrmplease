const OpenAI = require('openai');
const Student = require('../models/Student');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const User = require('../models/User');

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Get context about the user's data
async function getContext(userId, userRole) {
  const context = {
    students: [],
    meetings: [],
    tasks: []
  };

  try {
    if (userRole === 'admin') {
      // Admin sees all
      context.students = await Student.findAll({
        include: [{
          association: 'counsellors',
          attributes: ['id', 'firstName', 'lastName']
        }],
        limit: 50 // Limit for context
      });
      context.meetings = await Meeting.findAll({
        include: [{
          association: 'student',
          attributes: ['id', 'firstName', 'lastName']
        }],
        limit: 30,
        order: [['meetingDate', 'DESC']]
      });
      context.tasks = await Task.findAll({
        include: [
          { association: 'student', attributes: ['id', 'firstName', 'lastName'] },
          { association: 'assignedTo', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit: 30
      });
    } else {
      // Counsellors see only their assigned students
      const user = await User.findByPk(userId, {
        include: [{
          association: 'students',
          include: [{
            association: 'counsellors',
            attributes: ['id']
          }]
        }]
      });
      
      const studentIds = user.students?.map(s => s.id) || [];
      
      if (studentIds.length > 0) {
        context.students = await Student.findAll({
          where: { id: studentIds },
          include: [{
            association: 'counsellors',
            attributes: ['id', 'firstName', 'lastName']
          }]
        });
        
        context.meetings = await Meeting.findAll({
          where: { studentId: studentIds },
          include: [{
            association: 'student',
            attributes: ['id', 'firstName', 'lastName']
          }],
          limit: 30,
          order: [['meetingDate', 'DESC']]
        });
        
        context.tasks = await Task.findAll({
          where: { assignedToId: userId },
          include: [
            { association: 'student', attributes: ['id', 'firstName', 'lastName'] }
          ],
          limit: 30
        });
      }
    }
  } catch (error) {
    console.error('Error getting context:', error);
  }

  return context;
}

// Format context for AI
function formatContext(context) {
  let formatted = "IvyCRM Database Context:\n\n";
  
  formatted += "STUDENTS:\n";
  context.students.forEach(student => {
    formatted += `- ${student.firstName} ${student.lastName} (ID: ${student.id})\n`;
    if (student.parentName) formatted += `  Parent: ${student.parentName}\n`;
    if (student.school) formatted += `  School: ${student.school}\n`;
    if (student.leadStatus) formatted += `  Status: ${student.leadStatus}\n`;
    if (student.serviceType) formatted += `  Service: ${student.serviceType}\n`;
    if (student.price) formatted += `  Price: ${student.price}\n`;
    if (student.counsellors?.length > 0) {
      formatted += `  Counsellors: ${student.counsellors.map(c => c.firstName).join(', ')}\n`;
    }
    formatted += "\n";
  });

  formatted += "\nRECENT MEETINGS:\n";
  context.meetings.slice(0, 10).forEach(meeting => {
    const date = new Date(meeting.meetingDate).toLocaleDateString();
    formatted += `- ${date}: ${meeting.student?.firstName} ${meeting.student?.lastName} - ${meeting.notes.substring(0, 100)}...\n`;
  });

  formatted += "\nRECENT TASKS:\n";
  context.tasks.slice(0, 10).forEach(task => {
    formatted += `- ${task.title} (${task.status}) - ${task.student ? task.student.firstName + ' ' + task.student.lastName : 'No student'}\n`;
  });

  return formatted;
}

// Main AI query handler
async function queryAI(userQuery, userId, userRole) {
  try {
    if (!openai) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    // Get relevant context
    const context = await getContext(userId, userRole);
    const formattedContext = formatContext(context);

    const systemPrompt = `You are Ivy Intelligence, an AI assistant for a college counselling CRM system. 
You help users find information, understand where to put data, and answer questions about students, meetings, and tasks.

You have access to the following data:
${formattedContext}

IMPORTANT GUIDELINES:
- When users ask to find a student, provide their ID and key information
- When users ask where to put something, suggest the appropriate module (CRM for leads/students, Meeting Schedule for meeting notes, TMS for tasks)
- Be helpful and concise
- If you don't have enough information, say so
- Always provide actionable suggestions
- Use Turkish if the user asks in Turkish, otherwise use English

User's question: ${userQuery}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // Can be overridden
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      response: completion.choices[0].message.content,
      suggestions: extractSuggestions(completion.choices[0].message.content)
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response: ' + error.message);
  }
}

// Extract actionable suggestions from AI response
function extractSuggestions(response) {
  const suggestions = [];
  
  // Look for student IDs mentioned
  const studentIdMatch = response.match(/ID:\s*(\d+)/i) || response.match(/student\s+(\d+)/i);
  if (studentIdMatch) {
    suggestions.push({
      type: 'student',
      id: parseInt(studentIdMatch[1]),
      action: 'view'
    });
  }

  // Look for module suggestions
  if (response.toLowerCase().includes('crm') || response.toLowerCase().includes('lead')) {
    suggestions.push({ type: 'navigate', path: '/crm' });
  }
  if (response.toLowerCase().includes('meeting')) {
    suggestions.push({ type: 'navigate', path: '/meetings' });
  }
  if (response.toLowerCase().includes('task') || response.toLowerCase().includes('tms')) {
    suggestions.push({ type: 'navigate', path: '/tms' });
  }

  return suggestions;
}

module.exports = { queryAI };

