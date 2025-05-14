import HomePage from '../pages/home/home-page';
import SignInPage from '../pages/auth/signin/signin';
import SignUpPage from '../pages/auth/signup/signup';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import SaveStory from '../pages/save-story/save-story-page';
import SaveStoryDetail from '../pages/save-story-detail/save-story-detail-page';
import { parseActivePathname } from './url-parser';

const routes = {
  '/': new HomePage(),
  '/auth/signin': new SignInPage(),
  '/auth/signup': new SignUpPage(),
  '/add': new AddStoryPage(),
  '/save': new SaveStory(),
};

export default function getPage() {
  const { resource, id, verb } = parseActivePathname();

  if (resource === 'stories' && id) {
    return new StoryDetailPage();
  }

  if (resource === 'savestories' && id) {
    return new SaveStoryDetail();
  }

  if (resource === 'auth' && verb) {
    const authPath = `/${resource}/${verb}`;
    return routes[authPath] || routes['/'];
  }

  const path = `/${resource || ''}`;

  if (path === '/add') {
    return new AddStoryPage();
  }

  return routes[path] || routes['/'];
}
