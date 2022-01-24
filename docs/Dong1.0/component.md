上篇文章我们实现了 vdom 的渲染，这是前端框架的基础。但手写 vdom 太麻烦，我们又支持了 jsx，用它来写页面更简洁。

jsx 不是直接编译成 vdom 的，而是生成 render function，执行之后产生 vdom。

中间多加了一层 render function，可以执行一些动态逻辑。别小看这一层 render function，它恰恰是实现组件的原理。

## 实现组件渲染

支持了 jsx 后，可以执行一些动态逻辑，比如循环、比如从上下文中取值：

```javascript
const list = ['aaa', 'bbb'];
const jsx = <ul className="list">
    {
        list.map(item => <li className="item">{item}</li>)
    }    
</ul>

render(jsx, document.getElementById('root'));
```

这个封装成函数，然后传入参数不就是组件么？

我们在 render 函数里处理下函数组件的渲染：

```javascript
if (isComponentVdom(vdom)) {
    const props = Object.assign({}, vdom.props, {
        children: vdom.children
    });

    const componentVdom = vdom.type(props);
    return render(componentVdom, parent);
}
```

如果是 vdom 是一个组件，那么就创建 props 作为参数传入（props 要加上 children），执行该函数组件，拿到返回的 vdom 再渲染。

判断组件就是根据 type 是否为 function：
```javascript
function isComponentVdom(vdom) {
    return typeof vdom.type == 'function';
}
```

就这几行代码，我们就实现了函数组件。

测试下效果，声明两个函数组件，传入 props：

```javascript
function Item(props) {
    return <li className="item" style={props.style} onClick={props.onClick}>{props.children}</li>;
}

function List(props) {
    return <ul className="list">
        {props.list.map((item, index) => {
            return <Item style={{ background: item.color }} onClick={() => alert(item.text)}>{item.text}</Item>
        })}
    </ul>;
}

const list = [
    {
        text: 'aaa',
        color: 'blue'
    },
    {
        text: 'ccc',
        color: 'orange'
    },
    {
        text: 'ddd',
        color: 'red'
    }
]

render(<List list={list}/>, document.getElementById('root'));
```
在浏览器跑一下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd6b62d38ad04e50b454a910e88e6553~tplv-k3u1fbpfcp-watermark.image?)
我们实现了函数组件！

是不是非常简单！它其实就是在 jsx 的基础上封装成了函数，然后传入参数而已。

然后再实现下 class 组件：

class 组件需要声明一个类，有 state 的属性：

```javascript
class Component {
    constructor(props) {
        this.props = props || {};
        this.state = null;
    }
  
    setState(nextState) {
        this.state = nextState;
    }
}
```
然后渲染 vdom 的时候，如果是类组件，单独处理下：

```javascript
if (isComponentVdom(vdom)) {
    const props = Object.assign({}, vdom.props, {
        children: vdom.children
    });

    if (Component.isPrototypeOf(vdom.type)) {
        const instance = new vdom.type(props);

        const componentVdom = instance.render();
        instance.dom = render(componentVdom, parent);

        return instance.dom;
    } else {
        const componentVdom = vdom.type(props);
        return render(componentVdom, parent);
    }
}
```
判断如果 vdom 是 Component，就传入 props 创建实例，然后调用 render 拿到 vdom 再渲染。

还可以加上渲染前后的生命周期函数：

```javascript
const instance = new vdom.type(props);

instance.componentWillMount();

const componentVdom = instance.render();
instance.dom = render(componentVdom, parent);

instance.componentDidMount();

return instance.dom;
```

这样就实现了 class 组件。

我们测试下，声明一个 class 组件，传入 props，设置 state：

```javascript
function Item(props) {
    return <li className="item" style={props.style} onClick={props.onClick}>{props.children}</li>;
}

class List extends Component {
    constructor(props) {
        super();
        this.state = {
            list: [
                {
                    text: 'aaa',
                    color: 'blue'
                },
                {
                    text: 'bbb',
                    color: 'orange'
                },
                {
                    text: 'ccc',
                    color: 'red'
                }
            ],
            textColor: props.textColor
        }
    }

    render() {
        return <ul className="list">
            {this.state.list.map((item, index) => {
                return <Item style={{ background: item.color, color: this.state.textColor}} onClick={() => alert(item.text)}>{item.text}</Item>
            })}
        </ul>;
    }
}

render(<List textColor={'pink'}/>, document.getElementById('root'));
```
浏览器跑一下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/448a1346fc1340faa47495cc35962e61~tplv-k3u1fbpfcp-watermark.image?)

class 组件渲染成功！

就这样，我们实现了 class 组件，支持了 props 和 state。

代码上传到了 github：[https://github.com/QuarkGluonPlasma/frontend-framework-exercize](https://github.com/QuarkGluonPlasma/frontend-framework-exercize)

## 总结

上篇文章我们支持了 jsx，它编译产生 render function，执行之后可以拿到 vdom，然后再渲染。

多了这层 render function 之后，它可以执行很多动态逻辑，比如条件判断、循环，从上下文取值等。

对这些逻辑封装一下就是组件了：

- 封装成函数，传入 props，就是函数组件
- 封装成 class，传入 props，设置 state 属性，就是 class 组件

**组件本质上是对 vdom 的动态渲染逻辑的封装，class 和 function 是两种封装形式**。

实现了 vdom 的渲染之后，支持组件的两种封装形式是非常简单的事情。

至此，我们支持了 vdom 渲染、jsx 编译、class 和 function 组件，渲染部分基本差不多了，下篇文章我们来实现渲染之后的更新，也就是 patch 的功能。
