import React, { useRef, useState, useEffect}from 'react'
import './index.css'
import markdownIt from 'markdown-it'
// 引入掘金的样式
import '../../theme/DrakeTyporaTheme-master/drake-juejin.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
const md = new markdownIt(
    {
        breaks: true,   // 自动换行
        highlight: function (code, language) {      
            if (language && hljs.getLanguage(language)) {
              try {
                return `<pre><code class="hljs language-${language}">` +
                       hljs.highlight(code, { language  }).value +
                       '</code></pre>';
              } catch (__) {}
            }
        
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre>';
        }
    }
)
let scrolling   // 0: none; 1: 编辑区主动触发滚动; 2: 展示区主动触发滚动
let scrollTimer;  // 结束滚动的定时器

export default function MarkdownEdit() {
    const [htmlString, setHtmlString] = useState('')
    const [value, setValue] = useState('')   // 编辑区的文字内容
    const edit = useRef(null)
    const show = useRef(null)
 // 处理区域的滚动事件
    // 驱动一个元素进行滚动
    const driveScroll = (scale, el) => {
        let { scrollHeight } = el
        el.scrollTop = scrollHeight * scale

        if(scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            scrolling = 0    // 在滚动结束后，将scrolling设为0，表示滚动结束
            clearTimeout(scrollTimer)
        }, 200)
    }

 const handleScroll = (block, event) => {
    let { scrollHeight, scrollTop } = event.target
    let scale = scrollTop / scrollHeight  // 滚动比例

    // 当前滚动的是编辑区
    if(block === 1) {
        // 改变展示区的滚动距离
        if(scrolling === 0) scrolling = 1;  // 记录主动触发滚动的区域
        if(scrolling === 2) return;    // 当前是「展示区」主动触发的滚动，因此不需要再驱动展示区去滚动

        driveScroll(scale, show.current)  // 驱动「展示区」的滚动
    } else if(block === 2) {  // 当前滚动的是展示区
        // 改变编辑区的滚动距离
        if(scrolling === 0) scrolling = 2;  // 记录主动触发滚动的区域
        if(scrolling === 1) return;    // 当前是「展示区」主动触发的滚动，因此不需要再驱动展示区去滚动

        driveScroll(scale, edit.current)  // 驱动「展示区」的滚动
    }
 }
// 加粗工具
const addBlod = () => {
    // 获取编辑区光标的位置。未选中文字时：selectionStart === selectionEnd ；选中文字时：selectionStart < selectionEnd
    let { selectionStart, selectionEnd } = edit.current
    // console.log('开始选中', selectionStart, selectionEnd);
    let newValue = selectionStart === selectionEnd
        ? value.slice(0, selectionStart) + '**加粗文字**' + value.slice(selectionEnd)
        : value.slice(0, selectionStart) + '**' + value.slice(selectionStart, selectionEnd) + '**' + value.slice(selectionEnd)
    setValue(newValue)
}
    
 useEffect(() => {
    // 编辑区内容改变，更新value的值，并同步渲染
    setHtmlString(md.render(value))
}, [value])

    // const parse = (text) => setHtmlString(md.render(text))
    return (
        <div>
          <div className="tool_nav">
            <button onClick={addBlod}>加粗</button>
          </div>
          <div className="markdown_container">
                <textarea value={value}  onScroll={ (e) => handleScroll(1,e)}  ref={edit} className="edit"  style={{ resize: 'none'}}  onChange={(e) => setValue(e.target.value)} ></textarea>
                <div  onScroll={ (e) => handleScroll(2,e)} ref={show} id="write" className="show" dangerouslySetInnerHTML={{ __html: htmlString }}></div>
            </div>
        </div>
    )

}