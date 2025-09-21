import { errorResponse } from "./../utils/response";
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return errorResponse(
          res,
          "Validation failnd",
          400,
          errorMessages.map((e) => `${e.path}: ${e.message}`).join(", ")
        );
      }
      next(error);
    }
  };
