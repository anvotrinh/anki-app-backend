export default req => {
  const { useragent } = req;
  if (!useragent) {
    return false;
  }
  const { isMobile, isDesktop } = useragent;
  if (isMobile || isDesktop) {
    return true;
  }
  return false;
};
