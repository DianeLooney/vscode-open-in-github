import * as assert from 'assert';
import * as ext from '../src/extension';

suite('#getRemotes', () => {
  const mockRemoteResult = `
origin	git@github.yandex-team.ru:search-interfaces/web4.git (fetch)
origin	git@github.yandex-team.ru:search-interfaces/web4.git
upstream	https://github.yandex-team.ru/serp/web4 (fetch)
upstream	https://github.yandex-team.ru/serp/web4 (push)
`;

  test('should return correct remotes list', done => {
    ext
      .getRemotes((cmd, opts, cb) => cb(null, mockRemoteResult, null), '')
      .then((list) => {
        assert.deepEqual(
          list,
          [
            'git@github.yandex-team.ru:search-interfaces/web4.git',
            'https://github.yandex-team.ru/serp/web4'
          ]
        );
        done();
      })
      .catch(done);
  });

  test('should be rejected if error occured', done => {
    ext
      .getRemotes((cmd, opts, cb) => cb(null, mockRemoteResult, 'error'), '')
      .then(done)
      .catch(() => done());
  });
});

suite('#formatRemotes', () => {
  const mockRemotesList = [
    'git@github.com:d4rkr00t/language-stylus.git',
    'git@github.yandex-team.ru:search-interfaces/web4.git',
    'https://github.yandex-team.ru/serp/web4',
    'https://github.com/d4rkr00t/language-stylus',
    'ssh://user@host.xz/path/to/repo.git/',
    'git://host.xz/path/to/repo.git/',
    'https://host.xz/path/to/repo.git/',
    'ftps://host.xz/path/to/repo.git/',
    'http://host.xz/path/to/repo.git/',
    'ftp://host.xz/path/to/repo.git/'
  ];

  test('should correctly format all types of git remote urls', () => {
    const result = ext.formatRemotes(mockRemotesList);
    assert.deepEqual(
      result,
      [
        'https://github.com/d4rkr00t/language-stylus',
        'https://github.yandex-team.ru/search-interfaces/web4',
        'https://github.yandex-team.ru/serp/web4',
        'https://github.com/d4rkr00t/language-stylus',
        'https://host.xz/path/to/repo.git',
        'https://host.xz/path/to/repo.git',
        'https://host.xz/path/to/repo.git',
        'https://host.xz/path/to/repo.git',
        'http://host.xz/path/to/repo.git',
        'http://host.xz/path/to/repo.git'
      ]
    );
  });
});

suite('#getCurrentBranch', () => {
  const mockBranchResult = `
  dev
* sysoev/SERP-42779
`;

  test('should return correct current branch', done => {
    ext
      .getCurrentBranch((cmd, opts, cb) => cb(null, mockBranchResult, null), '')
      .then((branch) => {
        assert.equal(branch, 'sysoev/SERP-42779');
        done();
      })
      .catch(done);
  });

  test('should be rejected if error occured', done => {
    ext
      .getCurrentBranch((cmd, opts, cb) => cb(null, mockBranchResult, 'error'), '')
      .then(done)
      .catch(() => done());
  });
});

suite('#formatQuickPickItems', () => {
  test('should format strings for quick pick view', () => {
    const results = ext.formatQuickPickItems('rel/path/to/file.js', 10, ['https://remote.url'], 'master');
    assert.equal(results[0], '[master]\t—\thttps://remote.url/blob/master/rel/path/to/file.js#L10');
  });
});

suite('#prepareQuickPickItems', () => {
  suite('if current branch and master branch are equal', () => {
    test('should return only 1 item if there is only 1 remote', () => {
      const result = ext.prepareQuickPickItems('file.js', 10, 'master', [['https://rem'], 'master']);
      assert.equal(result.length, 1);
    });

    test('should return number of quick pick items equal to number of remotes', () => {
      const result = ext.prepareQuickPickItems('file.js', 10, 'master', [['https://rem', 'https://rem2'], 'master']);
      assert.equal(result.length, 2);
    });
  });

  suite('if current branch and master branch are not equal', () => {
    const result = ext.prepareQuickPickItems('file.js', 10, 'master', [['https://rem', 'https://rem2'], 'feat']);

    test('should merge quick pick items for current branch and master branch', () => {
      assert.equal(result.length, 4);
    });

    test('should merge quick pick items for current branch and master branch in correct order', () => {
      assert.ok(result[0].startsWith('[feat]'));
      assert.ok(result[1].startsWith('[master]'));
    });
  });
});
