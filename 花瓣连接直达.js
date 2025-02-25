// ==UserScript==
// @name         Huaban Direct Links
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Replace /go?pin_id= links on huaban.com with actual target URLs from the title attribute or URL parameters.
// @author       You
// @match        https://huaban.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // 处理链接替换的函数
  function processLinks() {
    // 获取所有包含目标链接特征的 <a> 标签
    const links = document.querySelectorAll('a[href*="/go?pin_id="]');

    // 遍历所有链接
    links.forEach(link => {
      // 获取 title 属性中的目标链接
      const titleURL = link.getAttribute('title');

      // 获取 href 中的 url 参数
      const hrefParams = new URLSearchParams(link.getAttribute('href'));
      const urlParam = hrefParams.get('url');

      // 确定目标 URL
      let targetURL = null;

      // 如果 title 属性是有效的 URL，则使用 title
      if (titleURL && (titleURL.startsWith('http://') || titleURL.startsWith('https://'))) {
        targetURL = titleURL;
      }
      // 如果 url 参数存在，则构建目标 URL
      else if (urlParam) {
        // 如果 url 参数包含协议（如 http:// 或 https://），则直接使用
        if (urlParam.startsWith('http://') || urlParam.startsWith('https://')) {
          targetURL = urlParam;
        }
        // 否则，直接使用 url 参数作为目标 URL（不添加 www）
        else {
          targetURL = `https://${urlParam}`;
        }
      }

      // 如果目标 URL 存在，则替换 href
      if (targetURL) {
        link.setAttribute('href', targetURL);
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // 初始运行
  processLinks();

  // 监听 DOM 变化
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        processLinks();
      }
    });
  });

  // 开始监听
  observer.observe(document.body, { childList: true, subtree: true });
})();
