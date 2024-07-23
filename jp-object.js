const	E		= _			=> document.createElement( _ )
const	AC		= ( $, _ )	=> $.appendChild( _ )
const	AE		= ( $, _ )	=> AC( $, E( _ ) )

export default class
JPObject extends HTMLElement {

	//	P_K stands for [ parent, key ]
	constructor( $, editable = false, removable = false, addable = false, P_K ) {
		super()

		this.$			= $

		this.editable	= editable
		this.removable	= removable
		this.addable	= addable

		P_K && this.classList.add( 'jp-object-indent' )

		this.OnClick = ( _ = [] ) => P_K
		?	P_K[ 0 ].OnClick( [ P_K, ..._ ] )
		:	this.clickReporter && this.clickReporter( _ )

		this.OnChange = _ => P_K 
		?	P_K[ 0 ].$[ P_K[ 1 ] ] = _
		:	console.error( 'Top level object' )
	}

	static get observedAttributes() {
		return [ 'json', 'editable', 'removable', 'addable' ]
	}
	attributeChangedCallback( name, oldValue, newValue ) {
		switch ( name ) {
		case 'json':
			this.$ = JSON.parse( newValue )
			break
		case 'editable':
		case 'removable':
		case 'addable':
			this[ name ] = newValue !== null
			break
		}
		this.$ && this.connectedCallback()
	}

	connectedCallback() {

		this.innerHTML = ''

		switch ( this.$ ) {
		case void 0:
			this.classList.add( 'jp-object-undefined' )
			break
		case null:
			this.classList.add( 'jp-object-null' )
			break
		default:
			this.classList.add( 'jp-object-' + this.$.constructor.name )
			switch ( this.$.constructor ) {
			case Object:
				this.addable && this.Adder( 
					v => Promise.resolve().then(	//	Avoid '[Violation] click handler took XXXXms'
						() => {
							const	k = prompt( 'input key' )
							switch ( k ) {
							case null:
								break
							case '':
								alert( 'The key must not be a null string:' + k )
								break
							default:
								this.$[ k ] !== void 0
								?	alert( 'Key dupped: ' + k )
								:	(	this.$[ k ] = v
									,	this.connectedCallback()
									)
								break
							}
						}
					)
				)
				for ( const k in this.$ ) this.DetailsE(
					k
				,	detailsE => (
						delete this.$[ k ]
					,	this.removeChild( detailsE )
					)
				)
				break
			case Array:
				this.addable && this.Adder(
					v => (
						this.$.push( v )
					,	this.connectedCallback()
					)
				)
				for ( const k in this.$ ) this.DetailsE(
					k
				,	() => (
						this.$.splice( k, 1 )
					,	this.connectedCallback()
					)
				)
				break
			case String:
				{	const $			= AE( this, 'textarea' )
					$.value			= this.$
					$.readOnly		= !this.editable
					$.rows			= 1
					$.placeholder	= 'string'
					$.onchange		= () => this.OnChange( $.value )
				}
				break
			case Number:
				{	const $			= AE( this, 'input' )
					$.value			= this.$
					$.readOnly		= !this.editable
					$.onchange		= () => this.OnChange( $.value )
				}
				break
			case Boolean:
				{	const $			= AE( this, 'input' )
					$.setAttribute( 'type', 'checkbox' )
					$.checked		= this.$
					this.editable || ( $.onclick = () => false )
					$.onchange		= () => this.OnChange( $.checked )
				}
				break
			default:
				this.textContent = this.$
				break
			}
		}
		this.onclick = ev => (
			ev.stopPropagation()
		,	this.OnClick()
		)
	}

	DetailsE( key, remover ) {
		const detailsE = AE( this, 'details' )
		detailsE.setAttribute( 'open', '' )
		const summaryE = AE( detailsE, 'summary' )
		summaryE.textContent = key
		if ( this.removable ) {
			const	_	= AE( summaryE, 'button' )
			_.onclick	= () => remover( detailsE )
			_.classList.add( 'jp-object-remover' )
		}
		AC( detailsE, new JPObject( this.$[ key ], this.editable, this.removable, this.addable, [ this, key ] ) )
	}
	Adder( adder ) {
		const	addB	= AE( this, 'button' )
		const	selectE	= AE( this, 'select' )
		const	Option	= _ => AE( selectE, 'option' ).textContent = _
		Option( 'String'	)
		Option( 'Number'	)
		Option( 'Boolean'	)
		Option( 'Object'	)
		Option( 'Array'		)
		Option( 'null'		)

		addB.classList.add( 'jp-object-adder' )
		addB.onclick	= () => {
			switch ( selectE.value ) {
			case 'String'	: adder( ''		); break
			case 'Number'	: adder( 0		); break
			case 'Boolean'	: adder( false	); break
			case 'Object'	: adder( {}		); break
			case 'Array'	: adder( []		); break
			case 'null'		: adder( null	); break
			}
		}
	}
}

customElements.define( 'jp-object', JPObject )
