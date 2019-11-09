function noop(){ }
// Object.getPrototypeOf(any) === any.__proto__
function decorate(base, stuff){
	class Decorated extends base{};
	Object.defineProperty(Decorated, 'name', {value: Decorated.name + base.name});
	Object.assign(Decorated.prototype, stuff);
	return Decorated;
}

/*
const React = window.React;
const proxy = proxied(React, 'React');
const Children = React.Children, Component = React.Component, PureComponent = React.PureComponent, PropType = React.PropTypes, DOM = proxied(React.DOM, 'DOM');
export { proxy as default, Children, Component, PureComponent, PropType, DOM };
*/

/*
from https://reactjs.org/docs/react-component.html#lifecycle-methods

start:
constructor()
static getDerivedStateFromProps()
render()
componentDidMount()

update:
static getDerivedStateFromProps()
shouldComponentUpdate()
render()
getSnapshotBeforeUpdate()
componentDidUpdate()

disconnect:
componentWillUnmount()

errors:
static getDerivedStateFromError()
componentDidCatch()

other:
setState()
forceUpdate()


v15

Proxy wraps class
when called with new then set props;

*/
const tagName = Symbol('tag-name');
const tagPrefix = 'an-';

/* SVG https://developer.mozilla.org/en-US/docs/Web/SVG/Element

a altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc discard ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hatch hatchpath hkern image line linearGradient marker mask mesh meshgradient meshpatch meshrow metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set solidcolor stop style svg switch symbol text textPath title tref tspan unknown use view vkern
*/
const isSVG = /^(?:a|altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|script|set|solidcolor|stop|style|svg|switch|symbol|text|textPath|title|tref|tspan|unknown|use|view|vkern)$/i;
// https://developer.mozilla.org/en-US/docs/Web/MathML/Element
const isMATHML = /^(?:math|mglyph|mi|mn|mo|ms|mspace|mtext|menclose|merror|mfenced|mfrac|mpadded|mphantom|mroot|mrow|msqrt|mstyle|mmultiscripts|mover|mprescripts|msub|msubsup|msup|munder|munderover|none|maligngroup|malignmark|mlabeledtr|mtable|mtd|mtr|mlongdiv|mscarries|mscarry|msgroup|msline|msrow|mstack|maction|annotation|annotation-xml|semantics)$/i;
/* math mglyph mi mn mo ms mspace mtext menclose merror mfenced mfrac mpadded mphantom mroot mrow msqrt mstyle mmultiscripts mover mprescripts msub msubsup msup munder munderover none maligngroup malignmark mlabeledtr mtable mtd mtr mlongdiv mscarries mscarry msgroup msline msrow mstack maction annotation annotation-xml semantics */
const propsKey = Symbol('propsKey');
class HTMLAnElement extends HTMLElement{
	constructor(props, context, updater){
		super();
		this.props = props;
		if(!this.state){
			this.state = {};
		};

		this.attachShadow({mode: 'open'}).innerHTML = `<slot></slot>`;
	}
	set props(props){
		Object.assign(this, props);
		return true;
	}
	get props(){
		return this;
	}
	static get isCallable(){
		return true;
	}
	static getDerivedStateFromProps(props, state){ return null; }
	static getDerivedStateFromError(){}
	componentDidCatch(error){
		console.error(error, this);
	}
	componentWillMount(){}
	componentDidMount(){}
	componentDidUpdate(props, state, snapshot=null){
		console.log('updated>',this);
	}
	//getSnapshotBeforeUpdate(props, state){}
	componentWillUnmount(){}
	/* NOT IMPLEMENTED:
		getSnapshotBeforeUpdate() https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate

	 */
	connectedCallback(){
		this.componentWillMount(); // WillUnmount removed in v17
		this.setState();
		this.componentDidMount();
	}
	disconnectedCallback(){
		this.componentWillUnount();
	}
/*
var el = document.createElement('Any');
el.constructor.name "HTMLUnknownElement"
 * */
	static get is(){
		let name = this[ tagName ];
		if(!name){
			name = this[ tagName ] = tagPrefix + this.name.toLowerCase();
			customElements.define(name, this);
		}
		return name;
	}
	get is(){
		return this.constructor.is;
	}
/*
	get refs(){
		// TODO
		return {};
	}
*/
	shouldComponentUpdate(){
		return true;
	}
	forceUpdate(cb){
		this.setState(this.state, cb, true);
	}
	async setState(state, cb=noop, force=false){
		Object.assign(this.state, state);
		this.constructor.getDerivedStateFromProps(this.props, this.state);
		try{
			if(force !== true && !this.shouldComponentUpdate(state)){
				return;
			}
			await Promise.resolve();
			//if(this.isConnected){
// TODO figure out more complex logic, replacing children
let content = this.render();
this.insertBefore( content, this.firstChild );
			//};
			this.componentDidUpdate();
			cb.call(this, this);
		}catch(err){
			this.componentDidCatch(err);
		}
		return this;
	}
	// render returns elements, Arrays and fragments, portals(to another dom node), strings+numbers, booleans/null (for testing return test && <Child/>)
	// override this
	render(){ return; }
}
const HTMLAnElementProxy = new Proxy(HTMLAnElement, {
	construct(base, args, extended){
		const instance = Reflect.construct(base, args, extended)
		return instance;
	}
});

const React = {
Component: HTMLAnElementProxy
,PureComponent: HTMLAnElementProxy
,version: '16.0.0'
,info: `compatible with React v15 v16; ... TODO`
,memo(){ }
,cloneElement(type, props, ...children){
// clone keep original key and ref; clone Object.get
// type could be an array?
// copy EXISTING children to clone
	Object.defineProperties(document.documentElement, Object.getOwnPropertyDescriptors(type))
}
// type = 'div' || Any extends HTMLAnElementProxy || ?fragment
// key, ref
/* https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
	Element.namespaceURI provides the NS used to create
	element.setAttributeNS(namespace, name, value)
	element.setAttribute(name, value); => el.setAttributeNS(el.namespaceURI, name, value);
*/ 
,createElement(type, props, ...children){
	let $0, name, ns;
	switch(typeof type){
	case 'string':
		ns = (isSVG.test(type) ? 'http://www.w3.org/2000/svg' : (isMATHML.test(type) ?  'http://www.w3.org/1998/mathml' : 'http://www.w3.org/1999/xhtml'));
		$0 = document.createElementNS(ns, type);
		//$0 = isSVG.test(type) ? document.createElementNS('http://www.w3.org/2000/svg', type) : (isMATHML.test(type) ?  document.createElementNS('http://www.w3.org/1998/mathml', type) : document.createElement(type));
	break;
	case 'function':
		// TODO cleanup
		name = type.is;
		if(name && !type.isCallable){
			$0 = document.createElement(name);
		}else{
			$0 = new type(props);
		};
	break;
	case 'object':
		// already created
		if(type instanceof Node){
			$0 = type;
		};
	break;
	};
	// TODO evaluate approaches
	if(props){
		//$0.props = props;
		Object.assign($0, props);
	};

	children.reduce(this._flatten, []).forEach(this._appendChild, $0);

	return $0;
}
,_flatten(list, item){
	if(item){
		if(item[Symbol.iterator]){
			list.push(...item);
		}else{
			list.push(item);
		};
	};
	return list;
}
,_appendChild(node){
	let $0;
	switch(typeof node){
	case 'string':
		$0 = this.ownerDocument.createTextNode(node);
	break;
	case 'object':
		if(node instanceof Node){
			$0 = node
		}else{
			console.warn(`unknown scenario in ${this.name}`,node);
		};
	break;
	case 'function':
		$0 = React.createElement(node);
	break;
	};

	if($0){
		this.appendChild($0);
	};
}
,createFactory(type, props, ...children){
	return this.createElement(type, props, children);
}
,isValidElement(item){
	return item instanceof HTMLAnElement;
}
,createReactClass(config){
	class ReactClass extends React.Component{};
	return Object.assign(ReactClass.prototype, config);
}
};
function toArray(item){
	if(Array.isArray(item)){
		return item;
	}else{
		return item[Symbol.iterator] ? Array.from(item) : Array.of(item);
	};
}
React.Children = {
	map(child, fn, scope){
		if(!child) return null;
		return this.toArray(child).map(fn, scope);
	}
	,forEach(child, fn, scope){
		return this.toArray(child).forEach(fn, scope);
	}
	,toArray
	,count(child){ return this.toArray(child).length; }
	,only(child){ const list = this.toArray(child); return list.length === 1; /* && list[0] instanceof HTMLAnElement */ }
};
// for <></> or <React.Fragment>
// TODO for new call
React.Fragment = class HTMLAnFragment extends DocumentFragment{}; // ?HTMLAnElement;
React.createRef = function(){
	// TODO? Proxy? https://reactjs.org/docs/refs-and-the-dom.html
	return {current: 'this'}
}
/* TODO above:
* how does microtimer work?
* just one render/promise per?
* resolve promise with correct value
* fix callbacks from promise on resolving/catch/etc calling appropriate callbacks
*/
// https://reactjs.org/docs/react-api.html
// TODO PropTypes, DOM
React.forwardRef = function(fn){
// TODO ... how should this work?
// see https://reactjs.org/docs/forwarding-refs.html#forwarding-refs-to-dom-components
	fn.call(this, this.props, ref);
}
React.lazy = function(fn){
// TODO? => lazily load a component: use dynamic import ? this is a reimplementation of dynamic imports... doesn't make much sense so-far
	return Promise.resolve(fn());
}
// TODO?
React.Suspense = class HTMLAnSuspenseElement extends HTMLAnElement{};

const ReactDOM = {
render($0, container, cb=noop){
	container.appendChild($0);
	cb($0, container);
	return $0;
}
,hydrate(...args){
	return this.render.apply(this, args);
}
,_unmountComponentAtNode(result, node){
	node.remove();
	return result || node instanceof HTMLAnElement;
}
,unmountComponentAtNode(container){
	return Array.from(container.children).reduce(this._unmountComponentAtNode, false);
}
,findDOMNode(component=null){
	// return the DOM node that is a react-ive element
	let $0 = component;
	while($0){
		if($0 instanceof HTMLAnElement || $0 instanceof HTMLAnFragment){ 
			break;
		};
		$0 = $0.parentNode;
	};
	return $0;
}
,createPortal($0, container){
// TODO https://reactjs.org/docs/portals.html
	$0.portal = container;
}
};

const { Component, PureComponent, Children, DOM } = React;
export { React as default, Children, Component, PureComponent, DOM, ReactDOM }
