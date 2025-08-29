import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INCIDENTS_FILE = path.join(__dirname, '../data/incidents.txt');

// Ensure incidents file exists
async function ensureIncidentsFile() {
  try {
    await fs.access(INCIDENTS_FILE);
  } catch (error) {
    await fs.writeFile(INCIDENTS_FILE, '# Incident Reports\n# Format: id|roadSegment|type|description|reportedBy|reporterName|timestamp|imageFileName\n');
  }
}

// Generate unique ID for incident
function generateIncidentId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle incident report submission
export async function handleIncidentReport(req, res) {
  try {
    await ensureIncidentsFile();
    
    const { roadSegment, type, description, reportedBy, reporterName } = req.body;
    
    // Validate required fields
    if (!roadSegment || !type || !description || !reportedBy || !reporterName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    const incidentId = generateIncidentId();
    const timestamp = new Date().toISOString();
    
    // Handle image upload (if present)
    let imageFileName = '';
    if (req.files && req.files.image) {
      const image = req.files.image;
      imageFileName = `incident_${incidentId}_${image.name}`;
      const imagePath = path.join(__dirname, '../data/images/', imageFileName);
      
      // Ensure images directory exists
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      await image.mv(imagePath);
    }
    
    // Create incident record
    const incidentRecord = `${incidentId}|${roadSegment}|${type}|${description.replace(/\|/g, '&#124;')}|${reportedBy}|${reporterName}|${timestamp}|${imageFileName}\n`;
    
    // Append to incidents file
    await fs.appendFile(INCIDENTS_FILE, incidentRecord);
    
    res.json({
      success: true,
      message: 'Incident reported successfully',
      incidentId: incidentId,
      timestamp: timestamp
    });
    
  } catch (error) {
    console.error('Error saving incident report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save incident report'
    });
  }
}

// Get all incidents (for future use)
export async function handleGetIncidents(req, res) {
  try {
    await ensureIncidentsFile();
    
    const data = await fs.readFile(INCIDENTS_FILE, 'utf-8');
    const lines = data.split('\n').filter(line => line && !line.startsWith('#'));
    
    const incidents = lines.map(line => {
      const [id, roadSegment, type, description, reportedBy, reporterName, timestamp, imageFileName] = line.split('|');
      return {
        id,
        roadSegment,
        type,
        description: description.replace(/&#124;/g, '|'),
        reportedBy,
        reporterName,
        timestamp,
        imageFileName
      };
    });
    
    res.json({
      success: true,
      incidents: incidents.reverse() // Most recent first
    });
    
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents'
    });
  }
}
