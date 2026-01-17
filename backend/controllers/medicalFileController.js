const MedicalFolder = require('../models/MedicalFolder');
const MedicalFile = require('../models/MedicalFile');
const MedicalAccount = require('../models/MedicalAccount');
const path = require('path');
const fs = require('fs').promises;

// Create upload directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, '../../uploads/medical-files');
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// ==================== FOLDERS ====================

// Get all folders for a medical user (tree structure)
exports.getFolders = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { category } = req.query;

    const where = { medical_account_id: medicalAccountId };
    if (category) {
      where.category = category;
    }

    const folders = await MedicalFolder.findAll({
      where,
      order: [['folder_name', 'ASC']]
    });

    // Build tree structure
    const buildTree = (parentId = null) => {
      return folders
        .filter(folder => folder.parent_id === parentId)
        .map(folder => ({
          ...folder.toJSON(),
          children: buildTree(folder.id)
        }));
    };

    const folderTree = buildTree();

    res.json({
      success: true,
      folders: folderTree,
      flatFolders: folders
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { folder_name, parent_id, category } = req.body;

    if (!folder_name || folder_name.trim().length === 0) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folderCategory = category || 'records';
    if (!['records', 'bills', 'profile'].includes(folderCategory)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate parent folder exists if provided
    if (parent_id) {
      const parentFolder = await MedicalFolder.findOne({
        where: { id: parent_id, medical_account_id: medicalAccountId }
      });
      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
    }

    // Check for duplicate folder name in same parent
    const existingFolder = await MedicalFolder.findOne({
      where: {
        medical_account_id: medicalAccountId,
        folder_name: folder_name.trim(),
        parent_id: parent_id || null
      }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    const folder = await MedicalFolder.create({
      medical_account_id: medicalAccountId,
      folder_name: folder_name.trim(),
      parent_id: parent_id || null,
      category: folderCategory
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

// Rename a folder
exports.renameFolder = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { folderId } = req.params;
    const { new_name } = req.body;

    if (!new_name || new_name.trim().length === 0) {
      return res.status(400).json({ error: 'New folder name is required' });
    }

    const folder = await MedicalFolder.findOne({
      where: { id: folderId, medical_account_id: medicalAccountId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check for duplicate name in same parent
    const duplicate = await MedicalFolder.findOne({
      where: {
        medical_account_id: medicalAccountId,
        folder_name: new_name.trim(),
        parent_id: folder.parent_id,
        id: { [require('sequelize').Op.ne]: folderId }
      }
    });

    if (duplicate) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    folder.folder_name = new_name.trim();
    await folder.save();

    res.json({
      success: true,
      message: 'Folder renamed successfully',
      folder
    });
  } catch (error) {
    console.error('Rename folder error:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
};

// Delete a folder (only if empty)
exports.deleteFolder = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { folderId } = req.params;

    const folder = await MedicalFolder.findOne({
      where: { id: folderId, medical_account_id: medicalAccountId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder has subfolders
    const subfolders = await MedicalFolder.count({
      where: { parent_id: folderId }
    });

    if (subfolders > 0) {
      return res.status(400).json({ error: 'Folder must be empty (no subfolders) to delete' });
    }

    // Check if folder has files
    const files = await MedicalFile.count({
      where: { folder_id: folderId }
    });

    if (files > 0) {
      return res.status(400).json({ error: 'Folder must be empty (no files) to delete' });
    }

    await folder.destroy();

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

// ==================== FILES ====================

// Get all files for a medical user
exports.getFiles = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { folder_id, category } = req.query;

    const where = { medical_account_id: medicalAccountId };
    
    if (category) {
      where.category = category;
    }
    
    if (folder_id) {
      where.folder_id = folder_id;
    } else if (folder_id === 'null' || folder_id === '') {
      where.folder_id = null;
    }

    const files = await MedicalFile.findAll({
      where,
      include: [
        {
          model: MedicalFolder,
          as: 'folder',
          attributes: ['id', 'folder_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Upload a file
exports.uploadFile = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { folder_id, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate folder if provided
    if (folder_id) {
      const folder = await MedicalFolder.findOne({
        where: { id: folder_id, medical_account_id: medicalAccountId }
      });
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'File type not allowed. Allowed: PDF, DOC, DOCX, JPG, PNG' });
    }

    const fileCategory = category || 'records';
    if (!['records', 'bills', 'profile'].includes(fileCategory)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Invalid category' });
    }

    const file = await MedicalFile.create({
      medical_account_id: medicalAccountId,
      folder_id: folder_id || null,
      category: fileCategory,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_path: req.file.path,
      file_size: req.file.size,
      uploaded_by: 'user',
      uploaded_by_id: medicalAccountId
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload file error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { fileId } = req.params;

    const file = await MedicalFile.findOne({
      where: { id: fileId, medical_account_id: medicalAccountId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.file_path, file.file_name);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const medicalAccountId = req.medicalUser.id;
    const { fileId } = req.params;

    const file = await MedicalFile.findOne({
      where: { id: fileId, medical_account_id: medicalAccountId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    try {
      await fs.unlink(file.file_path);
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete database record
    await file.destroy();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
