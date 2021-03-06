/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let testPort, sidebarPort, apiPort;

onconnect = function(e) {
  let port = e.ports[0];
  port.onmessage = function onMessage(event) {
    let topic = event.data.topic;
    switch (topic) {
      case "test-init":
        testPort = port;
        port.postMessage({topic: "test-init-done"});
        break;
      case "ping":
        port.postMessage({topic: "pong"});
        break;
      case "test-logout":
        apiPort.postMessage({topic: "social.user-profile", data: {}});
        break;
      case "sidebar-message":
        sidebarPort = port;
        if (testPort && event.data.result == "ok")
          testPort.postMessage({topic:"got-sidebar-message"});
        break;
      case "service-window-message":
        testPort.postMessage({topic:"got-service-window-message",
                              location: event.data.location});
        break;
      case "service-window-closed-message":
        testPort.postMessage({topic:"got-service-window-closed-message"});
        break;
      case "test-service-window":
        sidebarPort.postMessage({topic:"test-service-window"});
        break;
      case "test-service-window-twice":
        sidebarPort.postMessage({topic:"test-service-window-twice"});
        break;
      case "test-service-window-twice-result":
        testPort.postMessage({topic: "test-service-window-twice-result", result: event.data.result })
        break;
      case "test-close-service-window":
        sidebarPort.postMessage({topic:"test-close-service-window"});
        break;
      case "panel-message":
        if (testPort && event.data.result == "ok")
          testPort.postMessage({topic:"got-panel-message",
                                location: event.data.location
                               });
        break;
      case "status-panel-visibility":
        testPort.postMessage({topic:"got-social-panel-visibility", result: event.data.result });
        break;
      case "test-chatbox-open":
        sidebarPort.postMessage(event.data);
        break;
      case "chatbox-opened":
        testPort.postMessage(event.data);
        break;
      case "chatbox-message":
        testPort.postMessage({topic:"got-chatbox-message", result: event.data.result});
        break;
      case "chatbox-visibility":
        testPort.postMessage({topic:"got-chatbox-visibility", result: event.data.result});
        break;
      case "test-flyout-open":
        sidebarPort.postMessage({topic:"test-flyout-open"});
        break;
      case "flyout-message":
        testPort.postMessage({topic:"got-flyout-message", result: event.data.result});
        break;
      case "flyout-visibility":
        testPort.postMessage({topic:"got-flyout-visibility", result: event.data.result});
        break;
      case "test-flyout-close":
        sidebarPort.postMessage({topic:"test-flyout-close"});
        break;
      case "test-worker-chat":
        apiPort.postMessage({topic: "social.request-chat", data: event.data.data });
        break;
      case "social.initialize":
        // This is the workerAPI port, respond and set up a notification icon.
        // For multiprovider tests, we support acting like different providers
        // based on the domain we load from.
        apiPort = port;
        let profile;
        if (location.href.indexOf("https://test1.example.com") == 0) {
          profile = {
            portrait: "https://test1.example.com/portrait.jpg",
            userName: "tester",
            displayName: "Test1 User",
          };
        } else {
          profile = {
            portrait: "https://example.com/portrait.jpg",
            userName: "trickster",
            displayName: "Kuma Lisa",
            profileURL: "http://en.wikipedia.org/wiki/Kuma_Lisa"
          };
        }
        port.postMessage({topic: "social.user-profile", data: profile});
        break;
      case "test-ambient-notification":
        let icon = {
          name: "testIcon",
          iconURL: "chrome://browser/skin/Info.png",
          contentPanel: "https://example.com/browser/browser/base/content/test/social/social_panel.html",
          counter: 1
        };
        apiPort.postMessage({topic: "social.ambient-notification", data: icon});
        break;
      case "test-isVisible":
        sidebarPort.postMessage({topic: "test-isVisible"});
        break;
      case "test-isVisible-response":
        testPort.postMessage({topic: "got-isVisible-response", result: event.data.result});
        break;
      case "social.user-recommend-prompt":
        port.postMessage({
          topic: "social.user-recommend-prompt-response",
          data: {
            images: {
              // this one is relative to test we handle relative ones.
              share: "browser/browser/base/content/test/social/social_share_image.png",
              // absolute to check we handle them too.
              unshare: "https://example.com/browser/browser/base/content/test/social/social_share_image.png"
            },
            messages: {
              shareTooltip: "Share this page",
              unshareTooltip: "Unshare this page",
              sharedLabel: "This page has been shared",
              unsharedLabel: "This page is no longer shared",
              unshareLabel: "You have already shared this page",
              portraitLabel: "Your pretty face",
              unshareConfirmLabel: "Unshare it!",
              unshareConfirmAccessKey: "U",
              unshareCancelLabel: "Got it!",
              unshareCancelAccessKey: "G"
            }
          }
        });
        break;
    }
  }
}
