// navigation helper functions

// go to trainer page but skip the main app loading screen
export const navigateToTrainerWithoutLoading = () => {
  localStorage.setItem('skipLoading', 'true');
  return '/trainer';
};

// go to trainer page with no loading screens at all
export const navigateToTrainerWithNoAnimations = () => {
  localStorage.setItem('skipLoading', 'true');
  localStorage.setItem('skipTrainerLoading', 'true');
  return '/trainer';
};