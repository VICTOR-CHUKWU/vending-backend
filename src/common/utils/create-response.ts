// src/common/utils/response.util.ts

import { Response } from 'express';

/**
 * Send a JSON express response.
 *
 * @param res the ExpressResponse object.
 * @param statusCode the status code (success if in the 200s, failure otherwise).
 * @param message the message.
 * @param data the data contents.
 * @param pagination the pagination details, if any.
 * @returns {res} the response object, for chaining.
 */
export const createResponse = (
  res: Response,
  statusCode = 200,
  message = '',
  data: any = null,
  pagination: any = null,
) => {
  const success = 200 <= statusCode && statusCode < 300;

  return res.status(statusCode).json({
    success,
    status: statusCode,
    message,
    data,
    pagination,
  });
};
