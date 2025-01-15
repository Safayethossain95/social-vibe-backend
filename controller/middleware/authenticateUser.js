export const authenticateUser = (req, res, next) => {
    const token = req.cookies.token; // Assuming the token is stored in cookies
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded; // Attach user information to the request object
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };