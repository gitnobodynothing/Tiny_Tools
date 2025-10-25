// ==UserScript==
// @name         花瓣网链接直接跳转
// @name:en      Huaban Direct Link
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  跳过花瓣网（huaban.com）的中间跳转页面，直接访问图片来源网址。
// @description:en  Bypass the redirect page on huaban.com and go directly to the source URL.
// @author       Your Name
// @match        https://huaban.com/pins/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 核心函数：修复链接
    function fixHuabanLinks() {
        // 1. 使用CSS属性选择器，精确查找所有需要修改的链接
        // a[href^="/go?pin_id="] 表示选择所有href属性以"/go?pin_id="开头的<a>标签
        const linksToFix = document.querySelectorAll('a[href^="/go?pin_id="]');

        // 2. 遍历找到的所有链接
        linksToFix.forEach(link => {
            // 获取title属性，这里面存放着真实的URL
            const realUrl = link.title;

            // 3. 确保title属性存在并且不为空
            if (realUrl) {
                // 4. 将<a>标签的href属性修改为真实的URL
                link.href = realUrl;

                // (可选) 可以在控制台输出日志，方便调试
                // console.log(`[花瓣网直接跳转] 链接已修复: ${realUrl}`);
            }
        });
    }

    // --- 处理动态加载内容 ---
    // 花瓣网是瀑布流网站，内容会动态加载进来。
    // 我们需要一个“监视器”来检测页面的变化，当新内容出现时，再次执行我们的修复函数。
    // MutationObserver 就是专门做这个的。

    // 1. 创建一个监视器实例，当页面发生变化时，就调用 fixHuabanLinks 函数
    const observer = new MutationObserver(fixHuabanLinks);

    // 2. 配置监视器
    const config = {
        childList: true, // 监视目标节点（这里是body）的子节点（添加或删除）的变化
        subtree: true    // 监视所有后代节点的变化
    };

    // 3. 等待DOM加载完毕后，开始监视
    // 使用 document.documentElement 而不是 document.body，可以更早开始监视
    new MutationObserver((_, obs) => {
        if(document.body) {
            // 首次执行，修复页面上已经存在的链接
            fixHuabanLinks();
            // 开始监视整个body，以便处理后续动态加载的内容
            observer.observe(document.body, config);
            // 监视器启动后，断开自身的连接，因为它只运行一次
            obs.disconnect();
        }
    }).observe(document.documentElement, {childList: true, subtree: true});

})();
