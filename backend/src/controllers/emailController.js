import * as emailService from '../services/emailService.js';

export const sendEmail = async (req, res, next) => {
  try {
    const { to, templateName, variables } = req.body;

    const result = await emailService.sendEmailWithRetry(
      {
        to,
        templateName,
        variables,
      },
      3
    );

    res.status(200).json({
      success: true,
      message: `Recovery email '${templateName || 'CART_REMINDER'}' sent successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const templates = Object.values(emailService.EMAIL_TEMPLATES).map((t) => ({
      key: t.name,
      title: t.title,
      subject: t.subject,
    }));

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};
