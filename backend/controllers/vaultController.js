const InterviewExperience = require('../models/InterviewExperience');
const User = require('../models/User');

/**
 * Saves a new interview experience to MongoDB.
 */
exports.createExperience = async (req, res) => {
  try {
    console.log("Saving Interview Experience...");
    const { companyName, role, roundType, questionsAsked } = req.body;

    // Simple Validation
    if (!companyName || !role || !roundType || !questionsAsked) {
      return res.status(400).json({ error: 'Missing required fields: companyName, role, roundType, questionsAsked' });
    }

    // Resolve the authenticated user identity from the request first.
    const contributorId = req.user ? req.user.id : null;
    let contributorName = req.user && req.user.name ? req.user.name : null;

    if (!contributorName && contributorId) {
      const latestUser = await User.findById(contributorId).select('name').lean();
      contributorName = latestUser?.name || null;
    }

    // Prevent CastError by removing Optimistic UI's fake LOCAL_ ids
    const payload = { ...req.body };
    delete payload._id;

    // Normalize questionsAsked according to the model's schema type (string or array)
    try {
      const qPath = InterviewExperience.schema.path('questionsAsked');
      if (qPath && qPath.instance === 'String') {
        payload.questionsAsked = Array.isArray(payload.questionsAsked)
          ? JSON.stringify(payload.questionsAsked)
          : String(payload.questionsAsked);
      } else {
        // Expecting an array
        payload.questionsAsked = Array.isArray(payload.questionsAsked)
          ? payload.questionsAsked.map(q => String(q))
          : [String(payload.questionsAsked)];
      }
    } catch (e) {
      // Fallback: ensure it's a JSON string
      payload.questionsAsked = Array.isArray(payload.questionsAsked) ? JSON.stringify(payload.questionsAsked) : String(payload.questionsAsked);
    }

    const normalizedPayloadPreview = { ...payload, questionsAsked: payload.questionsAsked };
    console.log('Vault payload normalized:', { payloadPreview: normalizedPayloadPreview, contributorId, contributorName });

    const experience = new InterviewExperience({
      companyName: payload.companyName,
      role: payload.role,
      roundType: payload.roundType,
      questionsAsked: payload.questionsAsked,
      suggestions: payload.suggestions || '',
      importantTopics: Array.isArray(payload.importantTopics) ? payload.importantTopics : [],
      difficulty: payload.difficulty || 'Medium',
      contributorId: contributorId || '000000000000000000000000',
      contributorName: contributorName || 'Anonymous User'
    });

    await experience.save();
    console.log(`Experience saved successfully for ${companyName}`);

    res.status(201).json({ 
      success: true,
      message: 'Intelligence Manifest Uploaded', 
      experience 
    });
  } catch (err) {
    console.error('Vault Save Error:', err);
    res.status(500).json({ error: 'Database Synchronization Failed', details: err.message });
  }
};

/**
 * Retrieves all experiences.
 */
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({
      $or: [
        { isApproved: true },
        { contributorId: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves experiences by company.
 */
exports.getByCompany = async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({ 
      companyName: { $regex: req.params.companyName, $options: 'i' },
      $or: [
        { isApproved: true },
        { contributorId: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const updatePayload = { ...req.body };

    if (updatePayload.questionsAsked && !Array.isArray(updatePayload.questionsAsked)) {
      updatePayload.questionsAsked = String(updatePayload.questionsAsked);
    }

    const updated = await InterviewExperience.findByIdAndUpdate(experienceId, updatePayload, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Vault item not found.' });
    }

    res.json({ success: true, message: 'Vault experience updated.', experience: updated });
  } catch (err) {
    console.error('Vault Update Error:', err);
    res.status(500).json({ error: 'Failed to update vault experience.', details: err.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const deleted = await InterviewExperience.findByIdAndDelete(experienceId);
    if (!deleted) {
      return res.status(404).json({ error: 'Vault item not found.' });
    }
    res.json({ success: true, message: 'Vault experience deleted.' });
  } catch (err) {
    console.error('Vault Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete vault experience.', details: err.message });
  }
};
