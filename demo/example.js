export class HTMLAnElement extends HTMLElement{
	constructor(a, b){
		super(a ,b);
console.warn('an-element made', a,b);
		this.attachShadow({mode:'open'}).innerHTML = `
<style>
:host{background-color:#cf0;display:block;width:50px;height:50px;border:1px solid #000;text-align:center;}
slot,::slotted(*){font-style:italic;}
</style>
<slot>👆🏾</slot>
`;
		this.addEventListener('click', this.click.bind(this));
	}
	click(e){
		console.log(e.type, 'custom-element', this.data, this+'',this);
		this.hello();
	}
	hello(){
		const e = new CustomEvent('data', {composed: true, bubbles:true, cancelable: true, detail: {SAMPLE:'ANY', now: new Date}})
		this.dispatchEvent(e);
		//this.parentNode.onData(e);
	}
	get model(){ return this.data; }
	set model(data=null){
		this.data = data;
		return true;
	}
	handler(e){
		console.log(e.type, e.detail, this, e.target);
	}
	connectedCallback(){
		console.log(`>>connect ${this}`);
		self.addEventListener('data', this.handler);
	}
	disconnectedCallback(){
		console.log(`<<disconnect ${this}`);
		self.removeEventListener('data', this.handler);
	}
	toString(){
		return `[${typeof this} ${ this.nodeName } from ${ super.toString() }]`;
	}
};
self.customElements.define('an-element', HTMLAnElement);

class ReactClock extends React.Component {
	constructor(props, context, updater){
		super(props, context, updater);
		this.state = {when: props.when || new Date}
		this.type = 'ReactClock';
		this.onClick = this.onClick.bind(this);
		this.onData = this.onData.bind(this);
		// v16
		React.createRef && (this.refs = React.createRef());
	}
	componentDidMount(){
		console.warn('React.componentDidMount', this);
	}
	componentWillUnount(){
		console.warn('React.componentWillUnmount', this);
	}
	onData(e){
		const data = e.detail;
		console.log(e.type, this, e.detail, e);
		if(data.now){
			this.setState({when: data.now});
			/* both setState and forceUpdate replace it all
			this.state.when = data.now;
			this.forceUpdate();
			*/
		};
	}
	onClick(e){
		console.log(e.type, this, e);
	}
	componentDidUpdate(){ console.warn('React.componentDidUpdate', this); }
	componentWillReceiveProps(){ console.warn('React.componentWillReceiveProps', this); }

	shouldComponentUpdate(props, state){
		console.log('shouldComponentUpdate()>', this, props, state);
		return true;
	}
	componentWillUpdate(){ console.warn('React.componentWillUpdate', this); }
	componentWillUnmount(){ console.warn('React.componentWillUnmount', this); }
	// will complain if elements lack props.key
	render(){
		console.log('render',this.props, this.state, this.referendum, this.refs.current);
		return React.createElement(
/*function myElementCreate(...args){
debugger;
return 'div';
		}
*/ 'div', {key: Date.now(), onClick: this.onClick, ref: 'current'}, [`it's ${this.state.when.toLocaleTimeString()} React@${React.version}`, ...this.props.children]);
	}
}

const timeLabel = location.href.replace(/.*\//,'');
function tick(){
	console.time(timeLabel);
	const els = React.createElement(ReactClock, {date: new Date}, [React.createElement('hr', {key:44}), React.createElement('an-element', {key:47})]);//), React.createElement('hr'), React.createElement('an-element')];
	//ReactDOM.render(React.createElement('div', false, els), document.querySelector('[tick]'));
	ReactDOM.render(els, document.querySelector('[tick]'));
//	setTimeout(tick, 5000);
	console.timeEnd(timeLabel);
}
self.tick = tick;
self.addEventListener('load', tick);
