const Footer = () => {
  return (
    <footer>
      <div className="container">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} My App. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;