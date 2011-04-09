/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

function test() {
  let cw;
  let win;
  let prefix;

  let getToolbar = function () {
    return win.document.getElementById("TabsToolbar");
  }

  let assertToolbarButtonExists = function () {
    isnot(getToolbar().currentSet.indexOf("tabview-button"), -1,
          prefix + ": panorama button should be in the toolbar");
  }

  let assertToolbarButtonNotExists = function () {
    is(getToolbar().currentSet.indexOf("tabview-button"), -1,
       prefix + ": panorama button should not be in the toolbar");
  }

  let assertNumberOfGroups = function (num) {
    is(cw.GroupItems.groupItems.length, num, prefix + ': there are ' + num + ' groups');
  }

  let assertNumberOfTabs = function (num) {
    is(win.gBrowser.tabs.length, num, prefix + ': there are ' + num + ' tabs');
  }

  let removeToolbarButton = function () {
    let toolbar = getToolbar();
    let currentSet = toolbar.currentSet.split(",");
    let buttonId = "tabview-button";
    let pos = currentSet.indexOf(buttonId);

    if (-1 < pos) {
      currentSet.splice(pos, 1);
      toolbar.setAttribute("currentset", currentSet.join(","));
      toolbar.currentSet = currentSet.join(",");
      win.document.persist(toolbar.id, "currentset");
    }
  }

  let testNameGroup = function () {
    prefix = 'name-group';
    assertToolbarButtonNotExists();
    let groupItem = cw.GroupItems.groupItems[0];

    groupItem.setTitle('title');
    assertToolbarButtonNotExists();
    groupItem.setTitle('');

    EventUtils.synthesizeMouseAtCenter(groupItem.$titleShield[0], {}, cw);
    EventUtils.synthesizeKey('t', {}, cw);
    groupItem.$title[0].blur();

    assertToolbarButtonExists();
    next();
  }

  let testDragToCreateGroup = function () {
    prefix = 'drag-to-create-group';
    assertToolbarButtonNotExists();
    let width = cw.innerWidth;
    let height = cw.innerHeight;

    let body = cw.document.body;
    EventUtils.synthesizeMouse(body, width - 10, height - 10, {type: 'mousedown'}, cw);
    EventUtils.synthesizeMouse(body, width - 200, height - 200, {type: 'mousemove'}, cw);
    EventUtils.synthesizeMouse(body, width - 200, height - 200, {type: 'mouseup'}, cw);

    assertToolbarButtonExists();
    next();
  }

  let testCreateOrphan = function (tab) {
    prefix = 'create-orphan';
    assertNumberOfTabs(1);
    assertToolbarButtonNotExists();

    let width = cw.innerWidth;
    let height = cw.innerHeight;

    let body = cw.document.body;
    EventUtils.synthesizeMouse(body, width - 10, height - 10, {}, cw);
    EventUtils.synthesizeMouse(body, width - 10, height - 10, {}, cw);

    whenTabViewIsHidden(function () {
      assertNumberOfTabs(2);
      assertToolbarButtonExists();

      next();
    });
  }

  let testDragToCreateOrphan = function (tab) {
    if (!tab) {
      let tab = win.gBrowser.loadOneTab('about:blank', {inBackground: true});
      afterAllTabsLoaded(function () testDragToCreateOrphan(tab), win);
      return;
    }

    prefix = 'drag-to-create-orphan';
    assertNumberOfTabs(2);
    assertToolbarButtonNotExists();

    let width = cw.innerWidth;
    let height = cw.innerHeight;

    let target = tab._tabViewTabItem.container;
    let rect = target.getBoundingClientRect();
    EventUtils.synthesizeMouseAtCenter(target, {type: 'mousedown'}, cw);
    EventUtils.synthesizeMouse(target, rect.width - 10, rect.height - 10, {type: 'mousemove'}, cw);
    EventUtils.synthesizeMouse(target, width - 300, height - 300, {type: 'mousemove'}, cw);
    EventUtils.synthesizeMouse(target, width - 200, height - 200, {type: 'mousemove'}, cw);
    EventUtils.synthesizeMouseAtCenter(target, {type: 'mouseup'}, cw);

    assertToolbarButtonExists();
    next();
  }

  let testReAddingAfterRemoval = function () {
    prefix = 're-adding-after-removal';
    assertToolbarButtonNotExists();

    TabView.firstUseExperienced = true;
    removeToolbarButton();

    TabView.firstUseExperienced = true;
    TabView._addToolbarButton();

    assertToolbarButtonNotExists();
    next();
  }

  let tests = [testNameGroup, testDragToCreateGroup, testCreateOrphan,
               testDragToCreateOrphan, testReAddingAfterRemoval];

  let next = function () {
    let test = tests.shift();

    if (win)
      win.close();

    if (!test) {
      finish();
      return;
    }

    newWindowWithTabView(
      function (newWin) {
        cw = win.TabView.getContentWindow();
        let groupItem = cw.GroupItems.groupItems[0];
        groupItem.setSize(200, 200, true);
        groupItem.setUserSize();

        assertToolbarButtonNotExists();
        test();
      },
      function(newWin) {
        win = newWin;
        removeToolbarButton();
        TabView.firstUseExperienced = false;
        TabView.init();
      }
    );
  }

  waitForExplicitFinish();

  registerCleanupFunction(function () {
    if (win && !win.closed)
      win.close();
  });

  next();
}
