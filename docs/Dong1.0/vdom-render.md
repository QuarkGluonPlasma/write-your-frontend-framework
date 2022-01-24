作为前端工程师，前端框架几乎每天都要用到，需要好好掌握，而对某项技术的掌握程度可以根据是否能实现一个来判断。手写一个前端框架对更好的掌握它是很有帮助的事情。

现代前端框架经过多年的迭代都已经变得很复杂，理清它们的实现原理变得困难重重。所以我想写一个最简单版本的前端框架来帮助大家理清思路。

一个完整的前端框架涉及到的内容还是比较多的，我们一步步的来，这篇文章来实现下 vdom 的渲染。

## vdom 的渲染

vdom 全称 virtual dom，用来声明式的描述页面，现代前端框架很多都基于 vdom。前端框架负责把 vdom 转为对真实 dom 的增删改，也就是 vdom 的渲染。

那么 vdom 是什么样的？又是怎么渲染的呢？

dom 主要是元素、属性、文本，vdom 也是一样，其中元素是 {type、props、children} 的结构，文本就是字符串、数字。

比如这样一段 vdom：

```javascript
{
    type: 'ul',
    props: {
        className: 'list'
    },
    children: [
        {
            type: 'li',
            props: {
                className: 'item',
                style: {
                    background: 'blue',
                    color: '#fff'
                },
                onClick: function() {
                    alert(1);
                }
            },
            children: [
                'aaaa'
            ]
        },
        {
            type: 'li',
            props: {
                className: 'item'
            },
            children: [
                'bbbbddd'
            ]
        },
        {
            type: 'li',
            props: {
                className: 'item'
            },
            children: [
                'cccc'
            ]
        }
    ]
}
```

不难看出，它描述的是一个 ul 的元素、它有三个 li 子元素，其中第一个子元素有 style 的样式、还有 onClick 的事件。

前端框架就是通过这样的对象结构来描述界面的，然后把它渲染到 dom。

这样的对象结构怎么渲染呢？

明显要用递归，对不同的类型做不同的处理。

- 如果是文本类型，那么就要用 `document.createTextNode` 来创建文本节点。

- 如果是元素类型，那么就要用 `document.createElement`来创建元素节点，元素节点还有属性要处理，并且要递归的渲染子节点。

所以，vdom 的 render 逻辑就是这样的：

```javascript
if (isTextVdom(vdom)) {
    return mount(document.createTextNode(vdom));
} else if (isElementVdom(vdom)) {
    const dom = mount(document.createElement(vdom.type));
    for (const child of vdom.children) {
        render(child, dom);
    }
    for (const prop in vdom.props) {
        setAttribute(dom, prop, vdom.props[prop]);
    }
    return dom;
}
```
文本的判断就是字符串和数字：

```javascript
function isTextVdom(vdom) {
    return typeof vdom == 'string' || typeof vdom == 'number';
}
```
元素的判断就是对象，并且 type 为标签名的字符串：

```javascript
function isElementVdom(vdom) {
   return typeof vdom == 'object' && typeof vdom.type == 'string';
}
```
元素创建出来之后如果有父节点要挂载到父节点，组装成 dom 树：

```javascript
const mount = parent ? (el => parent.appendChild(el)) : (el => el);
```

所以，完整的 render 函数就是这样的：

```javascript
const render = (vdom, parent = null) => {
    const mount = parent ? (el => parent.appendChild(el)) : (el => el);
    if (isTextVdom(vdom)) {
        return mount(document.createTextNode(vdom));
    } else if (isElementVdom(vdom)) {
        const dom = mount(document.createElement(vdom.type));
        for (const child of vdom.children) {
            render(child, dom);
        }
        for (const prop in vdom.props) {
            setAttribute(dom, prop, vdom.props[prop]);
        }
        return dom;
    }
};
```
其中，元素的 dom 还要设置属性，比如上面 vdom 里有 style 和 onClick 的属性要设置。

style 属性是样式，支持对象，要把对象合并之后设置到 style，而 onClick 属性是事件监听器，用 addEventListener 设置，其余的属性都用 setAttribute 来设置。

```javascript
const setAttribute = (dom, key, value) => {
    if (typeof value == 'function' && key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        dom.addEventListener(eventType, value);
    } else if (key == 'style' && typeof value == 'object') {
        Object.assign(dom.style, value);
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(key, value);
    }
}
```

就这样，vdom 的渲染逻辑就完成了。

用上面那段 vdom 渲染试下效果：

```javascript
render(vdom, document.getElementById('root'));
```

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/944a3bc92491494ba3164f2b21d897a0~tplv-k3u1fbpfcp-watermark.image?)

vdom 的渲染成功！

小结一下：

**vdom 会递归的进行渲染，根据类型的不同，元素、文本会分别用 createTextNode、createElement 来递归创建 dom 并组装到一起，其中元素还要设置属性，style、事件监听器和其他属性分别用 addEventListener、setAttribute 等 api 进行设置。**

**通过不同的 api 创建 dom 和设置属性，这就是 vdom 的渲染流程。**

但是，vdom 写起来也太麻烦了，没人会直接写 vdom，一般是通过更友好的 DSL（领域特定语言） 来写，然后编译成 vdom，比如 jsx 和 template。

这里我们使用 jsx 的方式，因为可以直接用 babel 编译。

## jsx 编译成 vdom

上面的 vdom 改为 jsx 来写就是这样的：

```javascript
const jsx = <ul className="list">
    <li className="item" style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aaa</li>
    <li className="item">bbbb</li>
    <li className="item">cccc</li>
</ul>

render(jsx, document.getElementById('root'));
```

明显比直接写 vdom 紧凑了不少，但是需要做一次编译。

配置下 babel 来编译 jsx：

```javascript
module.exports = {
    presets: [
        [
            '@babel/preset-react',
            {
                pragma: 'createElement'
            }
        ]
    ]
}
```
编译产物是这样的：
```javascript
const jsx = createElement("ul", {
  className: "list"
}, createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aaa"), createElement("li", {
  className: "item"
}, "bbbb"), createElement("li", {
  className: "item"
}, "cccc"));
render(jsx, document.getElementById('root'));
```

为啥不直接是 vdom，而是一些函数呢？

因为这样会有一次执行的过程，可以放入一些动态逻辑，

比如从 data 取值：

```javascript
const data = {
    item1: 'bbb',
    item2: 'ddd'
}
const jsx = <ul className="list">
    <li className="item" style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aaa</li>
    <li className="item">{data.item1}</li>
    <li className="item">{data.item2}</li>
</ul>
```
会编译成：
```javascript
const data = {
  item1: 'bbb',
  item2: 'ddd'
};
const jsx = createElement("ul", {
  className: "list"
}, createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aaa"), createElement("li", {
  className: "item"
}, data.item1), createElement("li", {
  className: "item"
}, data.item2));
```
这叫做 render function，它执行的返回值就是 vdom。

这个 render function 名字之所以是 createElement，是因为我们上面 babel 配置里指定了 pragma 为 createElement。

render function 就是生成 vdom 的，所以实现很简单：

```javascript
const createElement = (type, props, ...children) => {
  return {
    type,
    props,
    children
  };
};
```

我们来测试下改为 jsx 之后的渲染：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da2e97d5410a49a9bd02ea10f87043b5~tplv-k3u1fbpfcp-watermark.image?)

渲染成功！

我们在 vdom 的基础上更进了一步，通过 jsx 来写一些动态逻辑，然后编译成 render function，执行之后产生 vdom。

这样比直接写 vdom 更简单，可以做更灵活的 vdom 生成逻辑。

代码上传到了 github：[https://github.com/QuarkGluonPlasma/frontend-framework-exercize](https://github.com/QuarkGluonPlasma/frontend-framework-exercize)

## 总结

手写前端框架是更好的掌握它的最直接的方式，我们会逐步实现一个功能完整的前端框架。

本文我们实现了 vdom 的渲染。vdom 是描述界面的对象，它的渲染就是通过 createElement、createTextNode 等 api 来递归创建和组装元素、文本等 dom 的过程，其中元素节点还需要设置属性，style、event listener 等属性会用不同的 api 设置。

虽然最终是 vdom 的渲染，但是开发时不会直接写 vdom，而是通过 jsx 来描述页面，然后编译成 render function，执行后产生 vdom。这样写起来更简洁，而且支持动态逻辑。（jsx 的编译使用 babel，可以指定 render function 的名字）

vdom 渲染和 jsx 是前端框架的基础，其他的功能比如组件是在这个基础之上实现的，下篇文章我们就来实现组件的渲染。
