/* global api */
class encn_Oxford {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return '必应词典(Bing)';
        if (locale.indexOf('TW') != -1) return '必應詞典(Bing)';
        return 'Oxford EN->CN Dictionary(bing)';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        let word_stem = await api.deinflect(word);
        let promises = [this.findOxford(word), this.findOxford(word_stem)];
        let results = await Promise.all(promises);
        return [].concat(...results).filter(x => x);
    }

    async findOxford(word) {
        let notes = [];
        if (!word) return notes;

        function T(node) {
            if (!node)
                return '';
            else
                return node.innerText.trim();
        }

        let base = 'https://cn.bing.com/dict/search?q=';
        let url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html').querySelector('.qdef');
        } catch (err) {
            return [];
        }

        // 提取基本信息
        let expression = T(doc.querySelector('#headword'));
        let reading_us = T(doc.querySelector('.hd_prUS')); // phonetic US
        let reading_uk = T(doc.querySelector('.hd_pr')); // phonetic UK
        let reading = reading_us && reading_uk ? `${reading_uk} ${reading_us}` : '';

        let audios = [];
        let audioslinks = doc.querySelectorAll('.hd_tf a');
        if (audioslinks) {
            for (const [index, audiolink] of audioslinks.entries()) {
                // 修正音频链接提取逻辑
                let audioMatch = audiolink.getAttribute('data-mp3link');
                if (audioMatch) {
                    audios[index] = 'https://cn.bing.com' + audioMatch;
                } else {
                    let onmouseover = audiolink.getAttribute('onmouseover');
                    if (onmouseover) {
                        let match = onmouseover.match(/https:.+?mp3/gi);
                        audios[index] = match ? match[0] : '';
                    }
                }
            }
        }

        // 只处理简化释义结构，忽略权威释义区域
        let simpleDefs = doc.querySelectorAll(':scope > ul > li');
        let additionalInfo = '';
        
        // 获取复数信息
        let pluralElement = doc.querySelector('.hd_div1 .hd_if');
        if (pluralElement) {
            additionalInfo = `<div class="additional">${T(pluralElement)}</div>`;
        }

        if (simpleDefs && simpleDefs.length > 0) {
            notes = this.parseSimpleDefs(simpleDefs, expression, reading, audios, additionalInfo);
        }

        // 为每个 note 添加基本信息
        notes.forEach(note => {
            note.expression = note.expression || expression;
            note.reading = note.reading || reading;
            note.audios = note.audios || audios;
            note.css = note.css || this.renderCSS();
        });

        return notes;
    }

    parseSimpleDefs(defItems, expression, reading, audios, additionalInfo) {
        let notes = [];
        let definitions = [];

        function T(node) {
            if (!node)
                return '';
            else
                return node.innerText.trim();
        }

        for (const defItem of defItems) {
            let posElement = defItem.querySelector('.pos');
            let pos = T(posElement);
            let def = T(defItem.querySelector('.def'));
            pos = pos ? `<span class='pos'>${pos}</span>` : '';
            if (pos || def) {
                definitions.push(`${pos}<span class='tran'>${def}</span>`);
            }
        }

        // 添加复数信息到最后
        if (additionalInfo) {
            definitions.push(additionalInfo);
        }

        if (definitions.length > 0) {
            notes.push({
                definitions: definitions
            });
        }

        return notes;
    }

    renderCSS() {
        let css = `
            <style>
                div.dis {font-weight: bold;margin-bottom:3px;padding:0;}
                span.grammar,
                span.informal   {margin: 0 2px;color: #0d47a1;}
                span.complement {margin: 0 2px;font-weight: bold;}
                div.idmphrase {font-weight: bold;margin: 0;padding: 0;}
                span.star {color: #FFBB00;}
                span.eng_dis  {margin-right: 5px;}
                span.chn_dis  {margin: 0;padding: 0;}
                span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                span.tran {margin:0; padding:0;}
                span.eng_tran {margin-right:3px; padding:0;}
                span.chn_tran {color:#0d47a1;}
                ul.sents {font-size:0.8em; list-style:square inside; margin:3px 0;padding:5px;background:rgba(13,71,161,0.1); border-radius:5px;}
                li.sent  {margin:0; padding:0;}
                span.eng_sent {margin-right:5px;}
                span.chn_sent {color:#0d47a1;}
                div.additional {margin-top: 5px; font-style: italic; color: #666;}
            </style>`;
        return css;
    }
}
