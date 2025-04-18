import React, { useState } from 'react';

const DarkLightToggle = () => {
  // Start in light mode
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      // Switch from Light → Dark
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      // Switch from Dark → Light
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  };

  return (
    <button onClick={toggleTheme} className="button">
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkLightToggle;
