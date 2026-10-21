import React, { createContext, useContext, useState } from 'react';

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Home');

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(prev => !prev);

  const navigateTo = (screenName, navigation) => {
    setCurrentScreen(screenName);
    closeDrawer();
    if (navigation) {
      if (['Home', 'Explore', 'Bookings', 'Safety', 'Profile'].includes(screenName)) {
        navigation.navigate('Main', { screen: `${screenName}Tab` });
      } else {
        navigation.navigate(screenName);
      }
    }
  };

  return (
    <DrawerContext.Provider value={{
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      currentScreen,
      setCurrentScreen,
      navigateTo
    }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => useContext(DrawerContext);

