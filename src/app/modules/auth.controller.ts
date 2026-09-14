import { Request, Response } from 'express';
import { AuthServices } from './auth.service';

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthServices.registerUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully! Please verify your account.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong during registration",
      errors: [
        {
          path: "",
          message: error.message,
        },
      ],
    });
  }
};

export const AuthControllers = {
  registerUser,
};