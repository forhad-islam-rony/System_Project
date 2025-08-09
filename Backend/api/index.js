import app from '../index.js';
import serverless from 'serverless-http';

export default (req, res) => {
  const handler = serverless(app);
  return handler(req, res);
};
