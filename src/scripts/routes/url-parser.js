function extractPathnameSegments(path) {
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  const splitUrl = trimmedPath.split('/').filter(Boolean);

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
    verb: splitUrl[1] || null,
    subResource: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat(`/${pathSegments.id}`);
  }

  if (pathSegments.subResource) {
    pathname = pathname.concat(`/${pathSegments.subResource}`);
  }

  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.slice(1) || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();

  // Check for dynamic routes (with parameters)
  if (pathname.startsWith('/stories/')) {
    return '/stories/:id';
  }

  return pathname;
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  const splitUrl = pathname.split('/').filter(Boolean);

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
    verb: splitUrl[1] || null,
    subResource: splitUrl[2] || null,
  };
}

export function getRoute(pathname) {
  return pathname;
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
