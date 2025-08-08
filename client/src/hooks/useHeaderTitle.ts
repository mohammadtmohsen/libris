import { RoutesName } from '_router/RoutesName';
import { useCallback, useMemo } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const useHeaderTitle = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pathArray = pathname.split('/');
  const canGoBack = pathArray?.length > 2;

  const getTitle = useCallback((pathName: string): string | undefined => {
    const match = Object.entries(RoutesName).find(([_, path]) =>
      matchPath({ path, caseSensitive: true, end: true }, pathName)
    );

    if (match) {
      const [key] = match;
      return key;
    }

    return 'Page Not Found';
  }, []);

  const title = useMemo(() => getTitle(pathname) || '', [getTitle, pathname]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      const previousPath = pathArray.slice(0, -1).join('/');
      navigate(previousPath);
    }
  }, [canGoBack, navigate, pathArray]);

  return { title, canGoBack, goBack };
};

export default useHeaderTitle;
