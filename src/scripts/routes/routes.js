import HomePage from '../pages/home/home-page';
import SignInPage from '../pages/auth/signin';
import SignUpPage from '../pages/auth/signup';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import { parseActivePathname } from './url-parser';

const routes = {
  '/': new HomePage(),
  '/auth/signin': new SignInPage(),
  '/auth/signup': new SignUpPage(),
};

export default function getPage() {
  const { resource, id, verb } = parseActivePathname();

  // Handle dynamic story detail routes
  if (resource === 'stories' && id) {
    return new StoryDetailPage();
  }

  // Handle auth routes
  if (resource === 'auth' && verb) {
    return routes[`/${resource}/${verb}`] || routes['/'];
  }

  return routes[`/${resource || ''}`] || routes['/'];
}
