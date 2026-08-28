import * as recoveryLinkService from '../services/recoveryLinkService.js';

export const generateLink = async (req, res, next) => {
  try {
    const { userId, cartId, expiresInHours, recoveryAmount } = req.body;

    const result = await recoveryLinkService.generateRecoveryLink(userId, cartId, {
      expiresInHours,
      recoveryAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Secure recovery URL generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const result = await recoveryLinkService.validateAndRedeemToken(token);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result,
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
