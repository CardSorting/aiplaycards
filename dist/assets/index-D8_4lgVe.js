import{a1 as A,d as S,ad as Y,aR as ye,aS as it,aT as at,aU as be,aV as st,aW as Se,a2 as lt,aX as re,aY as ct,aZ as ut,a_ as He,a$ as dt,b0 as pt,b1 as ft,ac as Ge,g as ht,ax as M,a7 as m,j as r,R as G}from"./index-EsxPKsM0.js";const We=()=>{const{rarityIconId:e,stateSetter:t}=A(),n=S.useMemo(()=>Y(ye,e,it),[e]),o=S.useMemo(()=>t("rarityIconId"),[t]);return{rarityIcons:ye,rarityIcon:n,setRarityIcon:o}},mt=()=>{const{rotationIconId:e,stateSetter:t}=A(),n=S.useMemo(()=>Y(be,e,at),[e]),o=S.useMemo(()=>t("rotationIconId"),[t]);return{rotationIcons:be,rotationIcon:n,setRotationIcon:o}},gt=()=>{const{setIconId:e,stateSetter:t,customSetIconSrc:n}=A(),o=S.useMemo(()=>Y(Se,e,st),[e]),i=S.useMemo(()=>t("setIconId"),[t]),h=S.useMemo(()=>t("customSetIconSrc"),[t]);return{setIcons:Se,setIcon:o,setSetIcon:i,customSetIconSrc:n,setCustomSetIconSrc:h}},ae=()=>{const{stateSetter:e}=A(),{supertype:t,type:n}=lt(),o=S.useMemo(()=>re?.filter(u=>u.logic?.isPokemonType)||[],[]),i=S.useMemo(()=>re?.filter(u=>u.logic?.isAttackCostType)||[],[]),h=S.useMemo(()=>e("typeId"),[e]),g=S.useCallback(u=>Y(re||[],u),[]);return S.useEffect(()=>{n&&t&&!n.supertypes?.includes(t.id)&&h(ct[t.id])},[h,t,n]),{attackCostTypes:i,pokemonTypes:o,types:re||[],type:n,setType:h,getTypeById:g}},xt=()=>{const{resistanceTypeId:e,stateSetter:t}=A(),{attackCostTypes:n}=ae(),o=S.useMemo(()=>Y(n,e,void 0),[n,e]),i=S.useMemo(()=>t("resistanceTypeId"),[t]);return{resistanceType:o,setResistanceType:i}},vt=()=>{const{weaknessTypeId:e,stateSetter:t}=A(),{attackCostTypes:n}=ae(),o=S.useMemo(()=>Y(n,e,ut),[n,e]),i=S.useMemo(()=>t("weaknessTypeId"),[t]);return{weaknessType:o,setWeaknessType:i}},yt=()=>{const{typeImgId:e,customTypeImgSrc:t,stateSetter:n,typeImgAmount:o}=A(),{pokemonTypes:i}=ae(),h=S.useMemo(()=>Y(i,e,He),[i,e]),g=S.useMemo(()=>n("typeImgId"),[n]),u=S.useMemo(()=>n("customTypeImgSrc"),[n]),c=S.useMemo(()=>n("typeImgAmount"),[n]);return{typeImg:h,setTypeImg:g,customTypeImgSrc:t,setCustomTypeImgSrc:u,typeImgAmount:o,setTypeImgAmount:c}},D=()=>{const{state:e,cardImgSrc:t}=S.useContext(dt);return{...e,cardImgSrc:t}},qe=747,bt=1038,St=bt/qe,Te=16,Tt="card",F=()=>{const{state:e,greatestEnergyCost:t}=S.useContext(pt);return{...e,greatestEnergyCost:t}},ge=()=>S.useContext(ft),Ue=typeof window<"u"?S.useLayoutEffect:S.useEffect;function wt(e,t,n,o){const i=S.useRef(t);Ue(()=>{i.current=t},[t]),S.useEffect(()=>{const h=window;if(!(h&&h.addEventListener))return;const g=u=>i.current(u);return h.addEventListener(e,g,o),()=>{h.removeEventListener(e,g)}},[e,n,o])}function Ct(e,t){const[n,o]=S.useState(e);return S.useEffect(()=>{const i=setTimeout(()=>o(e),t);return()=>{clearTimeout(i)}},[e,t]),n}function Et(){const[e,t]=S.useState(null),[n,o]=S.useState({width:0,height:0}),i=S.useCallback(()=>{o({width:e?.offsetWidth||0,height:e?.offsetHeight||0})},[e?.offsetHeight,e?.offsetWidth]);return wt("resize",i),Ue(()=>{i()},[e?.offsetHeight,e?.offsetWidth]),[t,n]}var oe={exports:{}},H={},J={},we;function It(){if(we)return J;we=1;var e=0;J.SAME=e;var t=1;return J.CAMELCASE=t,J.possibleStandardNames={accept:0,acceptCharset:1,"accept-charset":"acceptCharset",accessKey:1,action:0,allowFullScreen:1,alt:0,as:0,async:0,autoCapitalize:1,autoComplete:1,autoCorrect:1,autoFocus:1,autoPlay:1,autoSave:1,capture:0,cellPadding:1,cellSpacing:1,challenge:0,charSet:1,checked:0,children:0,cite:0,class:"className",classID:1,className:1,cols:0,colSpan:1,content:0,contentEditable:1,contextMenu:1,controls:0,controlsList:1,coords:0,crossOrigin:1,dangerouslySetInnerHTML:1,data:0,dateTime:1,default:0,defaultChecked:1,defaultValue:1,defer:0,dir:0,disabled:0,disablePictureInPicture:1,disableRemotePlayback:1,download:0,draggable:0,encType:1,enterKeyHint:1,for:"htmlFor",form:0,formMethod:1,formAction:1,formEncType:1,formNoValidate:1,formTarget:1,frameBorder:1,headers:0,height:0,hidden:0,high:0,href:0,hrefLang:1,htmlFor:1,httpEquiv:1,"http-equiv":"httpEquiv",icon:0,id:0,innerHTML:1,inputMode:1,integrity:0,is:0,itemID:1,itemProp:1,itemRef:1,itemScope:1,itemType:1,keyParams:1,keyType:1,kind:0,label:0,lang:0,list:0,loop:0,low:0,manifest:0,marginWidth:1,marginHeight:1,max:0,maxLength:1,media:0,mediaGroup:1,method:0,min:0,minLength:1,multiple:0,muted:0,name:0,noModule:1,nonce:0,noValidate:1,open:0,optimum:0,pattern:0,placeholder:0,playsInline:1,poster:0,preload:0,profile:0,radioGroup:1,readOnly:1,referrerPolicy:1,rel:0,required:0,reversed:0,role:0,rows:0,rowSpan:1,sandbox:0,scope:0,scoped:0,scrolling:0,seamless:0,selected:0,shape:0,size:0,sizes:0,span:0,spellCheck:1,src:0,srcDoc:1,srcLang:1,srcSet:1,start:0,step:0,style:0,summary:0,tabIndex:1,target:0,title:0,type:0,useMap:1,value:0,width:0,wmode:0,wrap:0,about:0,accentHeight:1,"accent-height":"accentHeight",accumulate:0,additive:0,alignmentBaseline:1,"alignment-baseline":"alignmentBaseline",allowReorder:1,alphabetic:0,amplitude:0,arabicForm:1,"arabic-form":"arabicForm",ascent:0,attributeName:1,attributeType:1,autoReverse:1,azimuth:0,baseFrequency:1,baselineShift:1,"baseline-shift":"baselineShift",baseProfile:1,bbox:0,begin:0,bias:0,by:0,calcMode:1,capHeight:1,"cap-height":"capHeight",clip:0,clipPath:1,"clip-path":"clipPath",clipPathUnits:1,clipRule:1,"clip-rule":"clipRule",color:0,colorInterpolation:1,"color-interpolation":"colorInterpolation",colorInterpolationFilters:1,"color-interpolation-filters":"colorInterpolationFilters",colorProfile:1,"color-profile":"colorProfile",colorRendering:1,"color-rendering":"colorRendering",contentScriptType:1,contentStyleType:1,cursor:0,cx:0,cy:0,d:0,datatype:0,decelerate:0,descent:0,diffuseConstant:1,direction:0,display:0,divisor:0,dominantBaseline:1,"dominant-baseline":"dominantBaseline",dur:0,dx:0,dy:0,edgeMode:1,elevation:0,enableBackground:1,"enable-background":"enableBackground",end:0,exponent:0,externalResourcesRequired:1,fill:0,fillOpacity:1,"fill-opacity":"fillOpacity",fillRule:1,"fill-rule":"fillRule",filter:0,filterRes:1,filterUnits:1,floodOpacity:1,"flood-opacity":"floodOpacity",floodColor:1,"flood-color":"floodColor",focusable:0,fontFamily:1,"font-family":"fontFamily",fontSize:1,"font-size":"fontSize",fontSizeAdjust:1,"font-size-adjust":"fontSizeAdjust",fontStretch:1,"font-stretch":"fontStretch",fontStyle:1,"font-style":"fontStyle",fontVariant:1,"font-variant":"fontVariant",fontWeight:1,"font-weight":"fontWeight",format:0,from:0,fx:0,fy:0,g1:0,g2:0,glyphName:1,"glyph-name":"glyphName",glyphOrientationHorizontal:1,"glyph-orientation-horizontal":"glyphOrientationHorizontal",glyphOrientationVertical:1,"glyph-orientation-vertical":"glyphOrientationVertical",glyphRef:1,gradientTransform:1,gradientUnits:1,hanging:0,horizAdvX:1,"horiz-adv-x":"horizAdvX",horizOriginX:1,"horiz-origin-x":"horizOriginX",ideographic:0,imageRendering:1,"image-rendering":"imageRendering",in2:0,in:0,inlist:0,intercept:0,k1:0,k2:0,k3:0,k4:0,k:0,kernelMatrix:1,kernelUnitLength:1,kerning:0,keyPoints:1,keySplines:1,keyTimes:1,lengthAdjust:1,letterSpacing:1,"letter-spacing":"letterSpacing",lightingColor:1,"lighting-color":"lightingColor",limitingConeAngle:1,local:0,markerEnd:1,"marker-end":"markerEnd",markerHeight:1,markerMid:1,"marker-mid":"markerMid",markerStart:1,"marker-start":"markerStart",markerUnits:1,markerWidth:1,mask:0,maskContentUnits:1,maskUnits:1,mathematical:0,mode:0,numOctaves:1,offset:0,opacity:0,operator:0,order:0,orient:0,orientation:0,origin:0,overflow:0,overlinePosition:1,"overline-position":"overlinePosition",overlineThickness:1,"overline-thickness":"overlineThickness",paintOrder:1,"paint-order":"paintOrder",panose1:0,"panose-1":"panose1",pathLength:1,patternContentUnits:1,patternTransform:1,patternUnits:1,pointerEvents:1,"pointer-events":"pointerEvents",points:0,pointsAtX:1,pointsAtY:1,pointsAtZ:1,prefix:0,preserveAlpha:1,preserveAspectRatio:1,primitiveUnits:1,property:0,r:0,radius:0,refX:1,refY:1,renderingIntent:1,"rendering-intent":"renderingIntent",repeatCount:1,repeatDur:1,requiredExtensions:1,requiredFeatures:1,resource:0,restart:0,result:0,results:0,rotate:0,rx:0,ry:0,scale:0,security:0,seed:0,shapeRendering:1,"shape-rendering":"shapeRendering",slope:0,spacing:0,specularConstant:1,specularExponent:1,speed:0,spreadMethod:1,startOffset:1,stdDeviation:1,stemh:0,stemv:0,stitchTiles:1,stopColor:1,"stop-color":"stopColor",stopOpacity:1,"stop-opacity":"stopOpacity",strikethroughPosition:1,"strikethrough-position":"strikethroughPosition",strikethroughThickness:1,"strikethrough-thickness":"strikethroughThickness",string:0,stroke:0,strokeDasharray:1,"stroke-dasharray":"strokeDasharray",strokeDashoffset:1,"stroke-dashoffset":"strokeDashoffset",strokeLinecap:1,"stroke-linecap":"strokeLinecap",strokeLinejoin:1,"stroke-linejoin":"strokeLinejoin",strokeMiterlimit:1,"stroke-miterlimit":"strokeMiterlimit",strokeWidth:1,"stroke-width":"strokeWidth",strokeOpacity:1,"stroke-opacity":"strokeOpacity",suppressContentEditableWarning:1,suppressHydrationWarning:1,surfaceScale:1,systemLanguage:1,tableValues:1,targetX:1,targetY:1,textAnchor:1,"text-anchor":"textAnchor",textDecoration:1,"text-decoration":"textDecoration",textLength:1,textRendering:1,"text-rendering":"textRendering",to:0,transform:0,typeof:0,u1:0,u2:0,underlinePosition:1,"underline-position":"underlinePosition",underlineThickness:1,"underline-thickness":"underlineThickness",unicode:0,unicodeBidi:1,"unicode-bidi":"unicodeBidi",unicodeRange:1,"unicode-range":"unicodeRange",unitsPerEm:1,"units-per-em":"unitsPerEm",unselectable:0,vAlphabetic:1,"v-alphabetic":"vAlphabetic",values:0,vectorEffect:1,"vector-effect":"vectorEffect",version:0,vertAdvY:1,"vert-adv-y":"vertAdvY",vertOriginX:1,"vert-origin-x":"vertOriginX",vertOriginY:1,"vert-origin-y":"vertOriginY",vHanging:1,"v-hanging":"vHanging",vIdeographic:1,"v-ideographic":"vIdeographic",viewBox:1,viewTarget:1,visibility:0,vMathematical:1,"v-mathematical":"vMathematical",vocab:0,widths:0,wordSpacing:1,"word-spacing":"wordSpacing",writingMode:1,"writing-mode":"writingMode",x1:0,x2:0,x:0,xChannelSelector:1,xHeight:1,"x-height":"xHeight",xlinkActuate:1,"xlink:actuate":"xlinkActuate",xlinkArcrole:1,"xlink:arcrole":"xlinkArcrole",xlinkHref:1,"xlink:href":"xlinkHref",xlinkRole:1,"xlink:role":"xlinkRole",xlinkShow:1,"xlink:show":"xlinkShow",xlinkTitle:1,"xlink:title":"xlinkTitle",xlinkType:1,"xlink:type":"xlinkType",xmlBase:1,"xml:base":"xmlBase",xmlLang:1,"xml:lang":"xmlLang",xmlns:0,"xml:space":"xmlSpace",xmlnsXlink:1,"xmlns:xlink":"xmlnsXlink",xmlSpace:1,y1:0,y2:0,y:0,yChannelSelector:1,z:0,zoomAndPan:1},J}var Ce;function jt(){if(Ce)return H;Ce=1,Object.defineProperty(H,"__esModule",{value:!0});function e(d,x){return t(d)||n(d,x)||o(d,x)||h()}function t(d){if(Array.isArray(d))return d}function n(d,x){var v=d==null?null:typeof Symbol<"u"&&d[Symbol.iterator]||d["@@iterator"];if(v!=null){var P=[],q=!0,V=!1,K,ne;try{for(v=v.call(d);!(q=(K=v.next()).done)&&(P.push(K.value),!(x&&P.length===x));q=!0);}catch(U){V=!0,ne=U}finally{try{!q&&v.return!=null&&v.return()}finally{if(V)throw ne}}return P}}function o(d,x){if(d){if(typeof d=="string")return i(d,x);var v=Object.prototype.toString.call(d).slice(8,-1);if(v==="Object"&&d.constructor&&(v=d.constructor.name),v==="Map"||v==="Set")return Array.from(d);if(v==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(v))return i(d,x)}}function i(d,x){(x==null||x>d.length)&&(x=d.length);for(var v=0,P=new Array(x);v<x;v++)P[v]=d[v];return P}function h(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var g=0,u=1,c=2,a=3,y=4,T=5,O=6;function N(d){return f.hasOwnProperty(d)?f[d]:null}function b(d,x,v,P,q,V,K){this.acceptsBooleans=x===c||x===a||x===y,this.attributeName=P,this.attributeNamespace=q,this.mustUseProperty=v,this.propertyName=d,this.type=x,this.sanitizeURL=V,this.removeEmptyString=K}var f={},I=["children","dangerouslySetInnerHTML","defaultValue","defaultChecked","innerHTML","suppressContentEditableWarning","suppressHydrationWarning","style"];I.forEach(function(d){f[d]=new b(d,g,!1,d,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(d){var x=e(d,2),v=x[0],P=x[1];f[v]=new b(v,u,!1,P,null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(d){f[d]=new b(d,c,!1,d.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(d){f[d]=new b(d,c,!1,d,null,!1,!1)}),["allowFullScreen","async","autoFocus","autoPlay","controls","default","defer","disabled","disablePictureInPicture","disableRemotePlayback","formNoValidate","hidden","loop","noModule","noValidate","open","playsInline","readOnly","required","reversed","scoped","seamless","itemScope"].forEach(function(d){f[d]=new b(d,a,!1,d.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(d){f[d]=new b(d,a,!0,d,null,!1,!1)}),["capture","download"].forEach(function(d){f[d]=new b(d,y,!1,d,null,!1,!1)}),["cols","rows","size","span"].forEach(function(d){f[d]=new b(d,O,!1,d,null,!1,!1)}),["rowSpan","start"].forEach(function(d){f[d]=new b(d,T,!1,d.toLowerCase(),null,!1,!1)});var k=/[\-\:]([a-z])/g,w=function(x){return x[1].toUpperCase()};["accent-height","alignment-baseline","arabic-form","baseline-shift","cap-height","clip-path","clip-rule","color-interpolation","color-interpolation-filters","color-profile","color-rendering","dominant-baseline","enable-background","fill-opacity","fill-rule","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","glyph-name","glyph-orientation-horizontal","glyph-orientation-vertical","horiz-adv-x","horiz-origin-x","image-rendering","letter-spacing","lighting-color","marker-end","marker-mid","marker-start","overline-position","overline-thickness","paint-order","panose-1","pointer-events","rendering-intent","shape-rendering","stop-color","stop-opacity","strikethrough-position","strikethrough-thickness","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","text-anchor","text-decoration","text-rendering","underline-position","underline-thickness","unicode-bidi","unicode-range","units-per-em","v-alphabetic","v-hanging","v-ideographic","v-mathematical","vector-effect","vert-adv-y","vert-origin-x","vert-origin-y","word-spacing","writing-mode","xmlns:xlink","x-height"].forEach(function(d){var x=d.replace(k,w);f[x]=new b(x,u,!1,d,null,!1,!1)}),["xlink:actuate","xlink:arcrole","xlink:role","xlink:show","xlink:title","xlink:type"].forEach(function(d){var x=d.replace(k,w);f[x]=new b(x,u,!1,d,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(d){var x=d.replace(k,w);f[x]=new b(x,u,!1,d,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(d){f[d]=new b(d,u,!1,d.toLowerCase(),null,!1,!1)});var R="xlinkHref";f[R]=new b("xlinkHref",u,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(d){f[d]=new b(d,u,!1,d.toLowerCase(),null,!0,!0)});var _=It(),s=_.CAMELCASE,l=_.SAME,p=_.possibleStandardNames,C=":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",j=C+"\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",$=RegExp.prototype.test.bind(new RegExp("^(data|aria)-["+j+"]*$")),L=Object.keys(p).reduce(function(d,x){var v=p[x];return v===l?d[x]=x:v===s?d[x.toLowerCase()]=x:d[x]=v,d},{});return H.BOOLEAN=a,H.BOOLEANISH_STRING=c,H.NUMERIC=T,H.OVERLOADED_BOOLEAN=y,H.POSITIVE_NUMERIC=O,H.RESERVED=g,H.STRING=u,H.getPropertyInfo=N,H.isCustomAttribute=$,H.possibleStandardNames=L,H}var Q={},se,Ee;function kt(){if(Ee)return se;Ee=1;var e=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,t=/\n/g,n=/^\s*/,o=/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,i=/^:\s*/,h=/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,g=/^[;\s]*/,u=/^\s+|\s+$/g,c=`
`,a="/",y="*",T="",O="comment",N="declaration";se=function(f,I){if(typeof f!="string")throw new TypeError("First argument must be a string");if(!f)return[];I=I||{};var k=1,w=1;function R(x){var v=x.match(t);v&&(k+=v.length);var P=x.lastIndexOf(c);w=~P?x.length-P:w+x.length}function _(){var x={line:k,column:w};return function(v){return v.position=new s(x),C(),v}}function s(x){this.start=x,this.end={line:k,column:w},this.source=I.source}s.prototype.content=f;function l(x){var v=new Error(I.source+":"+k+":"+w+": "+x);if(v.reason=x,v.filename=I.source,v.line=k,v.column=w,v.source=f,!I.silent)throw v}function p(x){var v=x.exec(f);if(v){var P=v[0];return R(P),f=f.slice(P.length),v}}function C(){p(n)}function j(x){var v;for(x=x||[];v=$();)v!==!1&&x.push(v);return x}function $(){var x=_();if(!(a!=f.charAt(0)||y!=f.charAt(1))){for(var v=2;T!=f.charAt(v)&&(y!=f.charAt(v)||a!=f.charAt(v+1));)++v;if(v+=2,T===f.charAt(v-1))return l("End of comment missing");var P=f.slice(2,v-2);return w+=2,R(P),f=f.slice(v),w+=2,x({type:O,comment:P})}}function L(){var x=_(),v=p(o);if(v){if($(),!p(i))return l("property missing ':'");var P=p(h),q=x({type:N,property:b(v[0].replace(e,T)),value:P?b(P[0].replace(e,T)):T});return p(g),q}}function d(){var x=[];j(x);for(var v;v=L();)v!==!1&&(x.push(v),j(x));return x}return C(),d()};function b(f){return f?f.replace(u,T):T}return se}var le,Ie;function Mt(){if(Ie)return le;Ie=1;var e=kt();function t(n,o){var i=null;if(!n||typeof n!="string")return i;for(var h,g=e(n),u=typeof o=="function",c,a,y=0,T=g.length;y<T;y++)h=g[y],c=h.property,a=h.value,u?o(c,a,h):a&&(i||(i={}),i[c]=a);return i}return le=t,le}var ee={},je;function Rt(){if(je)return ee;je=1,ee.__esModule=!0,ee.camelCase=void 0;var e=/^--[a-zA-Z0-9-]+$/,t=/-([a-z])/g,n=/^[^-]+$/,o=/^-(webkit|moz|ms|o|khtml)-/,i=/^-(ms)-/,h=function(a){return!a||n.test(a)||e.test(a)},g=function(a,y){return y.toUpperCase()},u=function(a,y){return"".concat(y,"-")},c=function(a,y){return y===void 0&&(y={}),h(a)?a:(a=a.toLowerCase(),y.reactCompat?a=a.replace(i,u):a=a.replace(o,u),a.replace(t,g))};return ee.camelCase=c,ee}var ke;function At(){return ke||(ke=1,(function(e){var t=Q&&Q.__importDefault||function(h){return h&&h.__esModule?h:{default:h}};e.__esModule=!0;var n=t(Mt()),o=Rt();function i(h,g){var u={};return!h||typeof h!="string"||(0,n.default)(h,function(c,a){c&&a&&(u[(0,o.camelCase)(c,g)]=a)}),u}e.default=i})(Q)),Q}var ce,Me;function Ve(){if(Me)return ce;Me=1;var e=Ge(),t=At().default;function n(a,y){if(!a||typeof a!="object")throw new TypeError("First argument must be an object");var T,O,N=typeof y=="function",b={},f={};for(T in a){if(O=a[T],N&&(b=y(T,O),b&&b.length===2)){f[b[0]]=b[1];continue}typeof O=="string"&&(f[O]=T)}return f}function o(a,y){if(a.indexOf("-")===-1)return y&&typeof y.is=="string";switch(a){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var i={reactCompat:!0};function h(a,y){if(a!=null)try{y.style=t(a,i)}catch{y.style={}}}var g=e.version.split(".")[0]>=16,u=new Set(["tr","tbody","thead","tfoot","colgroup","table","head","html","frameset"]);function c(a){return!u.has(a.name)}return ce={PRESERVE_CUSTOM_ATTRIBUTES:g,invertObject:n,isCustomComponent:o,setStyleProp:h,canTextBeChildOfNode:c,elementsWithNoTextChildren:u},ce}var ue,Re;function Xe(){if(Re)return ue;Re=1;var e=jt(),t=Ve();ue=function(i){i=i||{};var h={reset:!0,submit:!0},g,u,c,a,y,T={},O=i.type&&h[i.type];for(g in i){if(c=i[g],e.isCustomAttribute(g)){T[g]=c;continue}if(u=g.toLowerCase(),a=n(u),a){switch(y=e.getPropertyInfo(a),(a==="checked"||a==="value")&&!O&&(a=n("default"+u)),T[a]=c,y&&y.type){case e.BOOLEAN:T[a]=!0;break;case e.OVERLOADED_BOOLEAN:c===""&&(T[a]=!0);break}continue}t.PRESERVE_CUSTOM_ATTRIBUTES&&(T[g]=c)}return t.setStyleProp(i.style,T),T};function n(o){return e.possibleStandardNames[o]}return ue}var de,Ae;function Ot(){if(Ae)return de;Ae=1;var e=Ge(),t=Xe(),n=Ve(),o=n.setStyleProp,i=n.canTextBeChildOfNode;function h(u,c){c=c||{};for(var a=c.library||e,y=a.cloneElement,T=a.createElement,O=a.isValidElement,N=[],b,f,I=typeof c.replace=="function",k,w,R,_=c.trim,s=0,l=u.length;s<l;s++){if(b=u[s],I&&(k=c.replace(b),O(k))){l>1&&(k=y(k,{key:k.key||s})),N.push(k);continue}if(b.type==="text"){if(f=!b.data.trim().length,f&&b.parent&&!i(b.parent)||_&&f)continue;N.push(b.data);continue}switch(w=b.attribs,g(b)?o(w.style,w):w&&(w=t(w)),R=null,b.type){case"script":case"style":b.children[0]&&(w.dangerouslySetInnerHTML={__html:b.children[0].data});break;case"tag":b.name==="textarea"&&b.children[0]?w.defaultValue=b.children[0].data:b.children&&b.children.length&&(R=h(b.children,c));break;default:continue}l>1&&(w.key=s),N.push(T(b.name,w,R))}return N.length===1?N[0]:N}function g(u){return n.PRESERVE_CUSTOM_ATTRIBUTES&&u.type==="tag"&&n.isCustomComponent(u.name,u.attribs)}return de=h,de}var pe,Oe;function Nt(){if(Oe)return pe;Oe=1;var e="html",t="head",n="body",o=/<([a-zA-Z]+[0-9]?)/,i=/<head[^]*>/i,h=/<body[^]*>/i,g=function(){throw new Error("This browser does not support `document.implementation.createHTMLDocument`")},u=function(){throw new Error("This browser does not support `DOMParser.prototype.parseFromString`")},c=typeof window=="object"&&window.DOMParser;if(typeof c=="function"){var a=new c,y="text/html";u=function(f,I){return I&&(f="<"+I+">"+f+"</"+I+">"),a.parseFromString(f,y)},g=u}if(typeof document=="object"&&document.implementation){var T=document.implementation.createHTMLDocument();g=function(f,I){if(I){var k=T.documentElement.querySelector(I);return k.innerHTML=f,T}return T.documentElement.innerHTML=f,T}}var O=typeof document=="object"?document.createElement("template"):{},N;O.content&&(N=function(f){return O.innerHTML=f,O.content.childNodes});function b(f){var I,k=f.match(o);k&&k[1]&&(I=k[1].toLowerCase());var w,R,_;switch(I){case e:return w=u(f),i.test(f)||(R=w.querySelector(t),R&&R.parentNode.removeChild(R)),h.test(f)||(R=w.querySelector(n),R&&R.parentNode.removeChild(R)),w.querySelectorAll(e);case t:case n:return w=g(f),_=w.querySelectorAll(I),h.test(f)&&i.test(f)?_[0].parentNode.childNodes:_;default:return N?N(f):(R=g(f,n).querySelector(n),R.childNodes)}}return pe=b,pe}var ie={},X={},fe={},Ne;function Ye(){return Ne||(Ne=1,(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.Doctype=e.CDATA=e.Tag=e.Style=e.Script=e.Comment=e.Directive=e.Text=e.Root=e.isTag=e.ElementType=void 0;var t;(function(o){o.Root="root",o.Text="text",o.Directive="directive",o.Comment="comment",o.Script="script",o.Style="style",o.Tag="tag",o.CDATA="cdata",o.Doctype="doctype"})(t=e.ElementType||(e.ElementType={}));function n(o){return o.type===t.Tag||o.type===t.Script||o.type===t.Style}e.isTag=n,e.Root=t.Root,e.Text=t.Text,e.Directive=t.Directive,e.Comment=t.Comment,e.Script=t.Script,e.Style=t.Style,e.Tag=t.Tag,e.CDATA=t.CDATA,e.Doctype=t.Doctype})(fe)),fe}var E={},$e;function Pe(){if($e)return E;$e=1;var e=E&&E.__extends||(function(){var s=function(l,p){return s=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(C,j){C.__proto__=j}||function(C,j){for(var $ in j)Object.prototype.hasOwnProperty.call(j,$)&&(C[$]=j[$])},s(l,p)};return function(l,p){if(typeof p!="function"&&p!==null)throw new TypeError("Class extends value "+String(p)+" is not a constructor or null");s(l,p);function C(){this.constructor=l}l.prototype=p===null?Object.create(p):(C.prototype=p.prototype,new C)}})(),t=E&&E.__assign||function(){return t=Object.assign||function(s){for(var l,p=1,C=arguments.length;p<C;p++){l=arguments[p];for(var j in l)Object.prototype.hasOwnProperty.call(l,j)&&(s[j]=l[j])}return s},t.apply(this,arguments)};Object.defineProperty(E,"__esModule",{value:!0}),E.cloneNode=E.hasChildren=E.isDocument=E.isDirective=E.isComment=E.isText=E.isCDATA=E.isTag=E.Element=E.Document=E.CDATA=E.NodeWithChildren=E.ProcessingInstruction=E.Comment=E.Text=E.DataNode=E.Node=void 0;var n=Ye(),o=(function(){function s(){this.parent=null,this.prev=null,this.next=null,this.startIndex=null,this.endIndex=null}return Object.defineProperty(s.prototype,"parentNode",{get:function(){return this.parent},set:function(l){this.parent=l},enumerable:!1,configurable:!0}),Object.defineProperty(s.prototype,"previousSibling",{get:function(){return this.prev},set:function(l){this.prev=l},enumerable:!1,configurable:!0}),Object.defineProperty(s.prototype,"nextSibling",{get:function(){return this.next},set:function(l){this.next=l},enumerable:!1,configurable:!0}),s.prototype.cloneNode=function(l){return l===void 0&&(l=!1),R(this,l)},s})();E.Node=o;var i=(function(s){e(l,s);function l(p){var C=s.call(this)||this;return C.data=p,C}return Object.defineProperty(l.prototype,"nodeValue",{get:function(){return this.data},set:function(p){this.data=p},enumerable:!1,configurable:!0}),l})(o);E.DataNode=i;var h=(function(s){e(l,s);function l(){var p=s!==null&&s.apply(this,arguments)||this;return p.type=n.ElementType.Text,p}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 3},enumerable:!1,configurable:!0}),l})(i);E.Text=h;var g=(function(s){e(l,s);function l(){var p=s!==null&&s.apply(this,arguments)||this;return p.type=n.ElementType.Comment,p}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 8},enumerable:!1,configurable:!0}),l})(i);E.Comment=g;var u=(function(s){e(l,s);function l(p,C){var j=s.call(this,C)||this;return j.name=p,j.type=n.ElementType.Directive,j}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 1},enumerable:!1,configurable:!0}),l})(i);E.ProcessingInstruction=u;var c=(function(s){e(l,s);function l(p){var C=s.call(this)||this;return C.children=p,C}return Object.defineProperty(l.prototype,"firstChild",{get:function(){var p;return(p=this.children[0])!==null&&p!==void 0?p:null},enumerable:!1,configurable:!0}),Object.defineProperty(l.prototype,"lastChild",{get:function(){return this.children.length>0?this.children[this.children.length-1]:null},enumerable:!1,configurable:!0}),Object.defineProperty(l.prototype,"childNodes",{get:function(){return this.children},set:function(p){this.children=p},enumerable:!1,configurable:!0}),l})(o);E.NodeWithChildren=c;var a=(function(s){e(l,s);function l(){var p=s!==null&&s.apply(this,arguments)||this;return p.type=n.ElementType.CDATA,p}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 4},enumerable:!1,configurable:!0}),l})(c);E.CDATA=a;var y=(function(s){e(l,s);function l(){var p=s!==null&&s.apply(this,arguments)||this;return p.type=n.ElementType.Root,p}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 9},enumerable:!1,configurable:!0}),l})(c);E.Document=y;var T=(function(s){e(l,s);function l(p,C,j,$){j===void 0&&(j=[]),$===void 0&&($=p==="script"?n.ElementType.Script:p==="style"?n.ElementType.Style:n.ElementType.Tag);var L=s.call(this,j)||this;return L.name=p,L.attribs=C,L.type=$,L}return Object.defineProperty(l.prototype,"nodeType",{get:function(){return 1},enumerable:!1,configurable:!0}),Object.defineProperty(l.prototype,"tagName",{get:function(){return this.name},set:function(p){this.name=p},enumerable:!1,configurable:!0}),Object.defineProperty(l.prototype,"attributes",{get:function(){var p=this;return Object.keys(this.attribs).map(function(C){var j,$;return{name:C,value:p.attribs[C],namespace:(j=p["x-attribsNamespace"])===null||j===void 0?void 0:j[C],prefix:($=p["x-attribsPrefix"])===null||$===void 0?void 0:$[C]}})},enumerable:!1,configurable:!0}),l})(c);E.Element=T;function O(s){return(0,n.isTag)(s)}E.isTag=O;function N(s){return s.type===n.ElementType.CDATA}E.isCDATA=N;function b(s){return s.type===n.ElementType.Text}E.isText=b;function f(s){return s.type===n.ElementType.Comment}E.isComment=f;function I(s){return s.type===n.ElementType.Directive}E.isDirective=I;function k(s){return s.type===n.ElementType.Root}E.isDocument=k;function w(s){return Object.prototype.hasOwnProperty.call(s,"children")}E.hasChildren=w;function R(s,l){l===void 0&&(l=!1);var p;if(b(s))p=new h(s.data);else if(f(s))p=new g(s.data);else if(O(s)){var C=l?_(s.children):[],j=new T(s.name,t({},s.attribs),C);C.forEach(function(x){return x.parent=j}),s.namespace!=null&&(j.namespace=s.namespace),s["x-attribsNamespace"]&&(j["x-attribsNamespace"]=t({},s["x-attribsNamespace"])),s["x-attribsPrefix"]&&(j["x-attribsPrefix"]=t({},s["x-attribsPrefix"])),p=j}else if(N(s)){var C=l?_(s.children):[],$=new a(C);C.forEach(function(v){return v.parent=$}),p=$}else if(k(s)){var C=l?_(s.children):[],L=new y(C);C.forEach(function(v){return v.parent=L}),s["x-mode"]&&(L["x-mode"]=s["x-mode"]),p=L}else if(I(s)){var d=new u(s.name,s.data);s["x-name"]!=null&&(d["x-name"]=s["x-name"],d["x-publicId"]=s["x-publicId"],d["x-systemId"]=s["x-systemId"]),p=d}else throw new Error("Not implemented yet: ".concat(s.type));return p.startIndex=s.startIndex,p.endIndex=s.endIndex,s.sourceCodeLocation!=null&&(p.sourceCodeLocation=s.sourceCodeLocation),p}E.cloneNode=R;function _(s){for(var l=s.map(function(C){return R(C,!0)}),p=1;p<l.length;p++)l[p].prev=l[p-1],l[p-1].next=l[p];return l}return E}var De;function Ze(){return De||(De=1,(function(e){var t=X&&X.__createBinding||(Object.create?(function(u,c,a,y){y===void 0&&(y=a);var T=Object.getOwnPropertyDescriptor(c,a);(!T||("get"in T?!c.__esModule:T.writable||T.configurable))&&(T={enumerable:!0,get:function(){return c[a]}}),Object.defineProperty(u,y,T)}):(function(u,c,a,y){y===void 0&&(y=a),u[y]=c[a]})),n=X&&X.__exportStar||function(u,c){for(var a in u)a!=="default"&&!Object.prototype.hasOwnProperty.call(c,a)&&t(c,u,a)};Object.defineProperty(e,"__esModule",{value:!0}),e.DomHandler=void 0;var o=Ye(),i=Pe();n(Pe(),e);var h={withStartIndices:!1,withEndIndices:!1,xmlMode:!1},g=(function(){function u(c,a,y){this.dom=[],this.root=new i.Document(this.dom),this.done=!1,this.tagStack=[this.root],this.lastNode=null,this.parser=null,typeof a=="function"&&(y=a,a=h),typeof c=="object"&&(a=c,c=void 0),this.callback=c??null,this.options=a??h,this.elementCB=y??null}return u.prototype.onparserinit=function(c){this.parser=c},u.prototype.onreset=function(){this.dom=[],this.root=new i.Document(this.dom),this.done=!1,this.tagStack=[this.root],this.lastNode=null,this.parser=null},u.prototype.onend=function(){this.done||(this.done=!0,this.parser=null,this.handleCallback(null))},u.prototype.onerror=function(c){this.handleCallback(c)},u.prototype.onclosetag=function(){this.lastNode=null;var c=this.tagStack.pop();this.options.withEndIndices&&(c.endIndex=this.parser.endIndex),this.elementCB&&this.elementCB(c)},u.prototype.onopentag=function(c,a){var y=this.options.xmlMode?o.ElementType.Tag:void 0,T=new i.Element(c,a,void 0,y);this.addNode(T),this.tagStack.push(T)},u.prototype.ontext=function(c){var a=this.lastNode;if(a&&a.type===o.ElementType.Text)a.data+=c,this.options.withEndIndices&&(a.endIndex=this.parser.endIndex);else{var y=new i.Text(c);this.addNode(y),this.lastNode=y}},u.prototype.oncomment=function(c){if(this.lastNode&&this.lastNode.type===o.ElementType.Comment){this.lastNode.data+=c;return}var a=new i.Comment(c);this.addNode(a),this.lastNode=a},u.prototype.oncommentend=function(){this.lastNode=null},u.prototype.oncdatastart=function(){var c=new i.Text(""),a=new i.CDATA([c]);this.addNode(a),c.parent=a,this.lastNode=c},u.prototype.oncdataend=function(){this.lastNode=null},u.prototype.onprocessinginstruction=function(c,a){var y=new i.ProcessingInstruction(c,a);this.addNode(y)},u.prototype.handleCallback=function(c){if(typeof this.callback=="function")this.callback(c,this.dom);else if(c)throw c},u.prototype.addNode=function(c){var a=this.tagStack[this.tagStack.length-1],y=a.children[a.children.length-1];this.options.withStartIndices&&(c.startIndex=this.parser.startIndex),this.options.withEndIndices&&(c.endIndex=this.parser.endIndex),a.children.push(c),y&&(c.prev=y,y.next=c),c.parent=a,this.lastNode=null},u})();e.DomHandler=g,e.default=g})(X)),X}var he={},_e;function $t(){return _e||(_e=1,he.CASE_SENSITIVE_TAG_NAMES=["animateMotion","animateTransform","clipPath","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussainBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","foreignObject","linearGradient","radialGradient","textPath"]),he}var Le;function Pt(){if(Le)return ie;Le=1;for(var e=Ze(),t=$t(),n=t.CASE_SENSITIVE_TAG_NAMES,o=e.Comment,i=e.Element,h=e.ProcessingInstruction,g=e.Text,u={},c,a=0,y=n.length;a<y;a++)c=n[a],u[c.toLowerCase()]=c;function T(f){return u[f]}function O(f){for(var I={},k,w=0,R=f.length;w<R;w++)k=f[w],I[k.name]=k.value;return I}function N(f){f=f.toLowerCase();var I=T(f);return I||f}function b(f,I,k){I=I||null;for(var w=[],R=0,_=f.length;R<_;R++){var s=f[R],l;switch(s.nodeType){case 1:l=new i(N(s.nodeName),O(s.attributes)),l.children=b(s.childNodes,l);break;case 3:l=new g(s.nodeValue);break;case 8:l=new o(s.nodeValue);break;default:continue}var p=w[R-1]||null;p&&(p.next=l),l.parent=I,l.prev=p,l.next=null,w.push(l)}return k&&(l=new h(k.substring(0,k.indexOf(" ")).toLowerCase(),k),l.next=w[0]||null,l.parent=I,w.unshift(l),w[1]&&(w[1].prev=w[0])),w}return ie.formatAttributes=O,ie.formatDOM=b,ie}var me,Be;function Dt(){if(Be)return me;Be=1;var e=Nt(),t=Pt(),n=t.formatDOM,o=/<(![a-zA-Z\s]+)>/;function i(h){if(typeof h!="string")throw new TypeError("First argument must be a string");if(h==="")return[];var g=h.match(o),u;return g&&g[1]&&(u=g[1]),n(e(h),null,u)}return me=i,me}var ze;function _t(){if(ze)return oe.exports;ze=1;var e=Ot(),t=Xe(),n=Dt();n=typeof n.default=="function"?n.default:n;var o={lowerCaseAttributeNames:!1};function i(h,g){if(typeof h!="string")throw new TypeError("First argument must be a string");return h===""?[]:(g=g||{},e(n(h,g.htmlparser2||o),g))}return i.domToReact=e,i.htmlToDOM=n,i.attributesToProps=t,i.Element=Ze().Element,oe.exports=i,oe.exports.default=i,oe.exports}var Lt=_t();const te=ht(Lt);var Bt=te.domToReact;te.htmlToDOM;te.attributesToProps;te.Element;var B=(e=>(e.FrutigerLT55Roman="Frutiger LT 55 Roman",e.FrutigerLT66BoldItalic="Frutiger LT 66 Bold Italic",e.FuturaLTMediumBold="Futura LT Medium Bold",e.FuturaStdBoldOblique="Futura Std Bold Oblique",e.FuturaStdHeavy="Futura Std Heavy",e.GillSansStdBoldCondensed="Gill Sans Std Bold Condensed",e.GillSansStdRegularBold="Gill Sans Std Regular Bold",e.GillSansStdRegularItalic="Gill Sans Std Regular Italic",e.GillSansStdRegular="Gill Sans Std Regular",e.GillSansStdUltraBold="Gill Sans Std Ultra Bold",e.OptimaMedium="Optima Medium",e.PkmnTCGSpecialCharacters="Pokemon TCG Special Characters",e))(B||{});const zt=[{fontName:"Frutiger LT 55 Roman",fileName:"FrutigerLT-Roman"},{fontName:"Frutiger LT 66 Bold Italic",fileName:"FrutigerLT-BoldItalic"},{fontName:"Futura LT Medium Bold",fileName:"FuturaLT-Heavy"},{fontName:"Futura Std Bold Oblique",fileName:"FuturaStd-BoldOblique"},{fontName:"Futura Std Heavy",fileName:"FuturaStd-Heavy"},{fontName:"Gill Sans Std Bold Condensed",fileName:"GillSans-CondensedBold"},{fontName:"Gill Sans Std Regular Bold",fileName:"GillSans-Bold"},{fontName:"Gill Sans Std Regular Italic",fileName:"GillSans-Italic"},{fontName:"Gill Sans Std Regular",fileName:"GillSans"},{fontName:"Gill Sans Std Ultra Bold",fileName:"GillSans-ExtraBoldDisplay"},{fontName:"Optima Medium",fileName:"Optima-Medium"},{fontName:"Pokemon TCG Special Characters",fileName:"PKMN_TCG_SYM18"}];M`
  ${zt.map(e=>M`
      @font-face {
        font-family: '${e.fontName}';
        src: url('/fonts/${e.fileName}.woff2') format('woff2'),
          url('/fonts/${e.fileName}.woff') format('woff'),
          url('/fonts/${e.fileName}.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `)}
`;const Ft=m("p")`
  margin: 0;
  color: ${({$color:e})=>e};
  white-space: pre;

  ${({$outline:e})=>!!e&&M`
      filter: ${`url(#${e}OutlineEffect)`};
    `};
`,Ht=m("span")`
  font-family: '${B.PkmnTCGSpecialCharacters}', monospace;
  line-height: 0;
`,Ke={replace:e=>{const t=e;if(t&&t.type==="tag"){const n=Bt(t.children,Ke);switch(t.name){case"b":return r.jsx("b",{children:n});case"i":return r.jsx("i",{children:n});case"s":return r.jsx("s",{children:n});case"u":return r.jsx("u",{children:n});case"pkm":return r.jsx(Ht,{children:n});default:return null}}return e}},z=({outline:e,color:t="black",children:n,...o})=>{const i=S.useMemo(()=>S.Children.map(n,h=>{if(typeof h!="string")return h;const g=h.replace(/(?:\*)(?:(?!\s))((?:(?!\*|\n).)+)(?:\*)/g,"<b>$1</b>").replace(/(?:_)(?:(?!\s))((?:(?!\n|_).)+)(?:_)/g,"<i>$1</i>").replace(/(?:~)(?:(?!\s))((?:(?!\n|~).)+)(?:~)/g,"<s>$1</s>").replace(/(?:--)(?:(?!\s))((?:(?!\n|--).)+)(?:--)/g,"<u>$1</u>").replace(/(?:\[)(?:(?!\s))((?:(?!\n|\[).)+)(?:\])/g,"<pkm>$1</pkm>");return te(g,Ke)}),[n]);return r.jsx(Ft,{$outline:e,$color:t,...o,children:i})},Gt=m(z)`
  font-size: 1.15em;
  font-family: '${B.FrutigerLT66BoldItalic}', monospace;
  line-height: 0.88em;
  margin-left: -0.2em;
  letter-spacing: 0.02em;
`,Wt=()=>{const{cardNumber:e,totalInSet:t}=A(),{cardInfoOutline:n,cardInfoTextColor:o}=D();return!e&&!t?null:r.jsxs(Gt,{color:o,outline:n,children:[e&&r.jsx("span",{children:e}),e&&t&&r.jsx("span",{children:"/"}),t&&r.jsx("span",{children:t})]})},qt=m(z)`
  font-size: 0.81em;
  font-family: '${B.FuturaStdBoldOblique}', monospace;
  margin-left: 0.3em;
  margin-bottom: -0.1em;
`,Ut=()=>{const{illustrator:e}=A(),{hasIllustratorName:t}=F(),{cardInfoOutline:n,cardInfoTextColor:o}=D();return!t||!e?null:r.jsxs(qt,{color:o,outline:n,children:["Illus. ",e]})},Vt=m("div")`
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  width: initial;
  height: initial;
  background: none;
  opacity: 1;
  border: 0px;
  margin: 0px;
  padding: 0px;
  position: absolute;
  inset: 0px;
`,Xt=m("img")`
  position: absolute;
  inset: 0px;
  box-sizing: border-box;
  padding: 0px;
  border: none;
  margin: auto;
  display: block;
  width: 0px;
  height: 0px;
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
  object-fit: contain;
`,W=e=>r.jsx(Vt,{children:r.jsx(Xt,{alt:"",...e})}),Yt=m("div")`
  position: relative;
  height: 0.8em;
  width: 0.8em;
  margin-left: -0.35em;
  margin-bottom: 0.2em;
`,Zt=()=>{const{rarityIcon:e}=We(),{rarityIconColor:t}=D(),n=!!e&&(t==="white"?G.Assets.Icons.RarityWhite(e.slug):G.Assets.Icons.Rarity(e.slug));return n?r.jsx(Yt,{children:r.jsx(W,{src:n})}):null},Kt=m("div")`
  position: relative;

  ${({$shape:e})=>{switch(e){case"square":return M`
          margin-left: -0.4em;
          height: 1.6em;
          width: 1.6em;
        `;case"rectangle":return M`
          height: 1.8em;
          width: 1.2em;
        `;default:return}}}
`,Jt=()=>{const{rotationIcon:e}=mt(),t=!!e&&G.Assets.Icons.Rotation(e.slug);return t?r.jsx(Kt,{$shape:e.shape,children:r.jsx(W,{src:t})}):null},Qt=m("div")`
  position: relative;
  height: 2em;
  width: 2em;
`,en=()=>{const{setIcon:e,customSetIconSrc:t}=gt(),n=t||!!e&&G.Assets.Icons.Set(e.slug);return n?r.jsx(Qt,{children:r.jsx(W,{src:n})}):null},tn=m("div")`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 3.6%;
  left: 6.6%;
`,nn=m("div")`
  display: flex;
  gap: 0.8em;
  align-items: flex-end;
`,rn=()=>{const{hasCardInfo:e}=F();return e?r.jsx(r.Fragment,{children:r.jsxs(tn,{children:[r.jsx(Ut,{}),r.jsxs(nn,{children:[r.jsx(en,{}),r.jsx(Jt,{}),r.jsx(Wt,{}),r.jsx(Zt,{})]})]})}):null},on=m("img")`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  height: 100%;
  width: 100%;
  opacity: ${({$opacity:e})=>e};
  pointer-events: none;
`,an=()=>{const{showCardOverlay:e,overlayOpacity:t,overlayImgSrc:n}=ge();return!e||!n?null:r.jsx(on,{$opacity:t/100,src:n,alt:""})},sn=()=>{const{showDebug:e}=ge();return e?r.jsx(r.Fragment,{children:r.jsx(an,{})}):null},ln=m(z)`
  font-family: '${B.GillSansStdRegular}', monospace;
  font-size: 1.71em;
  letter-spacing: -0.003em;
  width: 100%;
  white-space: pre-wrap;
  text-align: justify;
  line-height: 1.05em;
`,cn=()=>{const{ability:e}=A(),{movesOutline:t,movesTextColor:n}=D();return r.jsx(ln,{outline:t,color:n,children:e?.description})},un=m(z)`
  font-family: '${B.GillSansStdBoldCondensed}', monospace;
  color: #a30000;
  font-size: 2.625em;
  letter-spacing: -0.05em;
  line-height: 1em;
`,dn=()=>{const{ability:e}=A(),{movesOutline:t}=D();return r.jsx(un,{outline:t,children:e?.name})},pn=m("div")`
  position: relative;
  height: 2.35em;
  width: 12.2em;
`,fn=()=>{const{abilitySymbol:e}=D(),t=!!e&&G.Assets.Symbols.Ability(e);return t?r.jsx(pn,{children:r.jsx(W,{src:t})}):null},hn=e=>e!=null,Z=m("div",{shouldForwardProp:e=>!["top","right","bottom","left","height","width","line-height","order","gap"].includes(e.toString())})`
  position: absolute;

  ${({top:e,right:t,bottom:n,left:o,height:i,width:h,order:g,gap:u,...c})=>{const a=c["line-height"];return Object.entries({top:e,right:t,bottom:n,left:o,height:i,width:h,order:g,gap:u,"line-height":a}).map(([y,T])=>T&&`${y}: ${T} !important;`).filter(hn)}}
`,mn=m(Z)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2em;
`,gn=m("div")`
  display: flex;
  gap: 0.5em;
`,xn=m("div")`
  padding: 0 3.5%;
`,vn=()=>{const{positions:{ability:e}}=D(),{hasAbility:t}=A();return t?r.jsxs(mn,{...e,children:[r.jsxs(gn,{children:[r.jsx(fn,{}),r.jsx(dn,{})]}),r.jsx(xn,{children:r.jsx(cn,{})})]}):null},yn=m("div")`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.2em;
  font-family: '${B.FuturaStdHeavy}', monospace;
  margin-left: auto;
`,bn=m(z)`
  line-height: 1.1em;
  font-size: 2.2em;
`,Sn=m(z)`
  position: absolute;
  font-size: 2em;
  top: 38%;
  right: -1em;
  transform: translate(-50%, -50%);
`,Tn=({move:e})=>{const{movesOutline:t,movesTextColor:n}=D();return e?.damageAmount===""?null:r.jsxs(yn,{children:[r.jsx(bn,{outline:t,color:n,children:e?.damageAmount}),r.jsx(Sn,{outline:t,color:n,children:e?.damageModifier})]})},wn=m(z)`
  font-family: '${B.GillSansStdRegular}', monospace;
  font-size: 1.67em;
  letter-spacing: -0.003em;
  width: 100%;
  white-space: pre-wrap;
  text-align: justify;
  line-height: 1.05em;
  min-height: 0.55em;

  ${({$isEmpty:e,$alignBottom:t,$isLastMove:n})=>(e||t&&n)&&M`
      min-height: 0;
    `}

  ${({$isOnlyMove:e,$alignBottom:t})=>e&&!t&&M`
      min-height: 1.55em;
    `}
`,Cn=({move:e,isLastMove:t,isOnlyMove:n})=>{const{movesOutline:o,movesTextColor:i,alignMovesBottom:h}=D();return r.jsx(wn,{outline:o,color:i,$alignBottom:h,$isLastMove:!!t,$isEmpty:!e?.description,$isOnlyMove:!!n,children:e?.description})},En=m("div")`
  display: flex;
  gap: 0.05em;
`,Fe=m("div")`
  position: relative;
  width: 2.75em;
  height: 2.75em;
`,In=({move:e})=>{const{getTypeById:t}=ae();return r.jsxs(En,{children:[e?.energyCost.length===0&&r.jsx(Fe,{children:r.jsx(W,{src:G.Assets.Icons.TypeBorder("empty")})}),e?.energyCost.length!==0&&[...e?.energyCost??[]].sort(n=>n.typeId===He.id?1:-1).flatMap((n,o)=>new Array(n.amount).fill(null).map((i,h)=>r.jsx(Fe,{children:r.jsx(W,{src:G.Assets.Icons.TypeBorder(t(n.typeId).slug)})},`${n.typeId}-${o}-${h}`)))]})},jn=m(z)`
  font-family: '${B.GillSansStdBoldCondensed}', monospace;
  font-size: 2.625em;
  letter-spacing: -0.055em;
  line-height: 0.85em;
  position: absolute;
  left: ${({$energyCost:e})=>`${Math.max(4,e)*7.5}%`};
`,kn=({move:e})=>{const{movesOutline:t,movesTextColor:n}=D(),{greatestEnergyCost:o}=F();return r.jsx(jn,{$energyCost:o,outline:t,color:n,children:e?.name})},Mn=m(Z)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5em;
`,Rn=m("div")`
  display: flex;
  width: 94.6%;
  margin-left: 2.2%;
  align-items: flex-end;
  gap: 0.5em;
`,An=m("div")`
  padding: 0 3.5%;
`,Je=({move:e,isLastMove:t,isOnlyMove:n,...o})=>{const{hasMoves:i,bonusMoveRequired:h}=F(),{hasMove2:g}=A();return!i||!(t&&h&&g)&&!e?.name?null:r.jsxs(Mn,{...o,children:[r.jsxs(Rn,{children:[r.jsx(In,{move:e}),r.jsx(kn,{move:e}),r.jsx(Tn,{move:e})]}),r.jsx(An,{children:r.jsx(Cn,{move:e,isLastMove:t,isOnlyMove:n})})]})},On=m(Je)`
  ${({$hasMove2:e,$alignBottom:t})=>!e&&!t&&M`
      margin: auto 0;
    `}
`,Nn=()=>{const{move1:e,hasMove2:t,move2:n,hasAbility:o,ability:i}=A(),{alignMovesBottom:h}=D(),{bonusMoveRequired:g}=F(),u=S.useMemo(()=>o&&!!i?.name,[o,i?.name]),c=S.useMemo(()=>t&&!!n?.name||g&&t,[t,n?.name,g]);return r.jsx(On,{move:e,isLastMove:!c,isOnlyMove:!u&&!c,$hasMove2:c,$alignBottom:h})},$n=()=>{const{positions:{move2:e}}=D(),{move2:t,hasMove2:n}=A();return n?r.jsx(Je,{move:t,isLastMove:!0,...e}):null},Pn=m(Z)`
  top: 53%;
  left: 5%;
  width: 90%;
  height: 30.5%;
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  ${({$hasMove2:e})=>e&&M`
      justify-content: space-evenly;
    `}

  ${({$alignBottom:e})=>e&&M`
      justify-content: flex-end;
      gap: 1em;
    `}
`,Dn=()=>{const{hasMoves:e}=F(),{alignMovesBottom:t,positions:{movesWrapper:n}}=D(),{hasMove2:o,move2:i}=A();return e?r.jsxs(Pn,{$hasMove2:o&&!!i?.name,$alignBottom:t,...n,children:[r.jsx(vn,{}),r.jsx(Nn,{}),r.jsx($n,{})]}):null},_n=m(z)`
  font-family: '${B.GillSansStdRegularBold}', monospace;
  font-size: 3.125em;
  letter-spacing: -0.05em;
`,Ln=()=>{const{name:e}=A(),{nameOutline:t,nameTextColor:n}=D();return e?r.jsx(_n,{outline:t,color:n,children:e}):null},Bn=m(Z)`
  position: relative;

  ${({$symbol:e})=>{switch(e){case"v":return M`
          height: 3.25em;
          width: 4.5em;
        `;case"vmax":return M`
          height: 3.25em;
          width: 6.6em;
        `;case"vstar":return M`
          height: 4em;
          width: 7em;
        `;case"star":return M`
          height: 3em;
          width: 5.5em;
        `;case"ex":return M`
          height: 3em;
          width: 4.2em;
        `;default:return}}}
`,zn=()=>{const{nameSymbol:e}=D(),t=!!e&&G.Assets.Symbols.Name(e);return t?r.jsx(Bn,{$symbol:e,children:r.jsx(W,{src:t})}):null},Fn=m(z)`
  align-self: flex-end;
  letter-spacing: -0.015em;

  ${({$beforeName:e})=>e?M`
          /* Pokémon's subname */
          font-family: '${B.GillSansStdRegularBold}', monospace;
          order: -1;
          font-size: 1.6em;
          line-height: 1.85em;
          margin-right: 0.2em;
        `:M`
          /* Trainer's subname */
          font-family: '${B.FrutigerLT66BoldItalic}', monospace;
          color: #6b6c6e;
          font-size: 1.45em;
          margin-left: auto;
          line-height: 1.8em;
        `}
`,Hn=()=>{const{nameOutline:e,nameTextColor:t,hasSubnameBeforeName:n}=D(),{subname:o}=A(),{hasSubname:i}=F();return!i||!o?null:r.jsx(Fn,{outline:e,color:t,$beforeName:!!n,children:o})},Gn=m(Z)`
  display: flex;
  align-items: center;
`,Wn=()=>{const{hasName:e}=F(),{positions:{name:t}}=D();return e?r.jsxs(Gn,{...t,children:[r.jsx(Ln,{}),r.jsx(zn,{}),r.jsx(Hn,{})]}):null},qn=m(z)`
  display: block;
  position: absolute;
  text-align: right;

  ${({$size:e})=>e==="sm"?M`
          top: 3.5%;
          right: 13.2%;
        `:M`
          top: 2.5%;
          right: 13.8%;
        `};
`,Un=m("span")`
  ${({$size:e})=>e==="sm"?M`
          font-family: '${B.GillSansStdUltraBold}', monospace;
          font-size: 1.0625em;
          letter-spacing: -0.035em;
          font-weight: bold;
        `:M`
          font-family: 'Gill Sans Std', monospace;
          font-size: 1em;
          letter-spacing: -0.035em;
          font-weight: bold;
        `};
`,Vn=m("span")`
  font-family: '${B.FuturaLTMediumBold}', monospace;
  letter-spacing: -0.05em;

  ${({$size:e})=>e==="sm"?M`
          font-size: 2.7em;
        `:M`
          font-size: 3.55em;
        `};
`,Xn=()=>{const{hasHitpoints:e}=F(),{hitpoints:t}=A(),{hpSize:n,hpOutline:o,hpTextColor:i}=D();return!e||t===""?null:r.jsxs(qn,{$size:n,outline:o,color:i,children:[r.jsx(Un,{$size:n,children:"HP"}),r.jsx(Vn,{$size:n,children:t})]})},Yn=m(z)`
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.05em;
`,Zn=m("span")`
  font-size: 1.84em;
  line-height: 1.1em;
`,Kn=m("span")`
  line-height: 0.5em;
  font-size: 2.1em;
`,Jn=()=>{const{resistanceAmount:e}=A(),{typeBarTextColor:t,typeBarOutline:n}=D();return r.jsxs(Yn,{color:t,outline:n,children:[r.jsx(Kn,{children:"-"}),r.jsx(Zn,{children:e})]})},xe=m("div")`
  position: relative;
  height: 1.7em;
  width: 1.7em;
`,Qn=()=>{const{resistanceType:e}=xt(),t=!!e&&G.Assets.Icons.Type(e.slug);return t?r.jsx(xe,{children:r.jsx(W,{src:t})}):null},er=m("div")`
  position: absolute;
  right: 0.3%;
  width: 23%;
  display: flex;
  gap: 0.2em;
`,tr=G.Assets.Icons.Type("colorless"),nr=()=>{const{retreatCost:e}=A();return e?r.jsx(er,{children:new Array(e).fill(void 0).map((t,n)=>r.jsx(xe,{children:r.jsx(W,{src:tr})},n))}):null},rr=m(z)`
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.2em;
`,or=m("span")`
  font-size: 1.84em;
  line-height: 1.1em;
`,ir=m("span")`
  line-height: 0.5em;
  font-size: 1.5em;
  margin-bottom: 0.165em;
`,ar=()=>{const{weaknessAmount:e}=A(),{typeBarTextColor:t,typeBarOutline:n}=D();return r.jsxs(rr,{color:t,outline:n,children:[r.jsx(ir,{children:"×"}),r.jsx(or,{children:e})]})},sr=()=>{const{weaknessType:e}=vt(),t=!!e&&G.Assets.Icons.Type(e.slug);return t?r.jsx(xe,{children:r.jsx(W,{src:t})}):null},lr=m("div")`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 11.2%;
  left: 4.2%;
  width: 88.8%;
  height: 3%;
`,Qe=m("div")`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.35em;
  font-family: '${B.FuturaLTMediumBold}', monospace;
`,cr=m(Qe)`
  left: 13.3%;
`,ur=m(Qe)`
  left: 42.5%;
`,dr=()=>{const{hasTypeBar:e}=F(),{weaknessTypeId:t,weaknessAmount:n,resistanceTypeId:o,resistanceAmount:i}=A();return e?r.jsxs(lr,{children:[!!n&&!!t&&r.jsxs(cr,{children:[r.jsx(sr,{}),r.jsx(ar,{})]}),!!i&&!!o&&r.jsxs(ur,{children:[r.jsx(Qn,{}),r.jsx(Jn,{})]}),r.jsx(nr,{})]}):null},pr=S.createContext(null),fr=()=>S.useContext(pr),hr=m("div")`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
`,mr=m("img")`
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
`,gr={height:0,width:0,x:0,y:0},ve=({src:e,croppedArea:t=gr,...n})=>{const o=!!t&&t.width>0&&t.height>0,i=S.useMemo(()=>{if(!o)return null;const g=100/t.width;return{x:`${-t.x*g}%`,y:`${-t.y*g}%`,scale:g,width:"calc(100% + 0.5px)",height:"auto"}},[t,o]),h=S.useMemo(()=>i?{transform:`translate3d(${i.x}, ${i.y}, 0) scale3d(${i.scale}, ${i.scale}, 1)`,width:i.width,height:i.height}:{width:"100%",height:"100%",objectFit:"cover"},[i]);return r.jsx(hr,{...n,children:r.jsx(mr,{src:e,alt:"",style:h})})},xr=m("div")`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
`,vr=m("video")`
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
`,yr={height:0,width:0,x:0,y:0},br=({src:e,croppedArea:t=yr,...n})=>{const o=!!t&&t.width>0&&t.height>0,i=S.useMemo(()=>{if(!o)return null;const g=100/t.width;return{x:`${-t.x*g}%`,y:`${-t.y*g}%`,scale:g,width:"calc(100% + 0.5px)",height:"auto"}},[t,o]),h=S.useMemo(()=>i?{transform:`translate3d(${i.x}, ${i.y}, 0) scale3d(${i.scale}, ${i.scale}, 1)`,width:i.width,height:i.height}:{width:"100%",height:"100%",objectFit:"cover"},[i]);return r.jsx(xr,{...n,children:r.jsx(vr,{src:e,style:h,autoPlay:!0,loop:!0,muted:!0,playsInline:!0,preload:"auto"})})},Sr=m("div")`
  position: absolute;
  pointer-events: none;
  z-index: -2;
  /* Space a bit away from the borders so it's not visible outside of the card */
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  top: 4px;
  left: 4px;
  transform-style: preserve-3d;
  transform: translateZ(-10px);

  /* Subtle depth with shadowbox effect */
  filter: blur(0.5px) brightness(0.95);
`,Tr=m(ve)`
  border-radius: 30px;
`,wr=m(br)`
  border-radius: 30px;
`,Cr=()=>{const{backgroundImg:e}=A(),t=fr();if(!e)return null;const n=t?.animationUrl,o=n?t.animationUrl:e.src;return r.jsx(Sr,{"data-bg-src":o,children:n?r.jsx(wr,{src:o,croppedArea:e.croppedArea}):r.jsx(Tr,{...e})})},Er=m("div")`
  position: relative;
  pointer-events: none;
  height: 100%;
  width: 100%;
  z-index: -1;
  transform-style: preserve-3d;
  transform: translateZ(10px);

  /* Enhanced shadowbox depth */
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) brightness(1.02);

  /* Subtle material texture */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 30%,
      rgba(0, 0, 0, 0.02) 100%
    );
    pointer-events: none;
    border-radius: inherit;
  }
`,Ir=()=>{const{cardImgSrc:e}=D();return e?r.jsx(Er,{children:r.jsx(W,{src:e})}):null},jr=m(Z)`
  display: flex;
  align-items: center;
`,kr=m(z)`
  font-family: '${B.GillSansStdRegular}', monospace;
  font-size: 1.635em;
  letter-spacing: 0.002em;
  white-space: pre-line;
  text-align: justify;
  line-height: inherit;
`,Mr=()=>{const{hasDescription:e}=F(),{description:t}=A(),{movesOutline:n,movesTextColor:o,positions:{description:i}}=D();return!e||!t?null:r.jsx(jr,{...i,children:r.jsx(kr,{outline:n,color:o,children:t})})},Rr=m(z)`
  position: absolute;
  top: 48%;
  left: 11%;
  width: 78%;
  font-family: '${B.FrutigerLT55Roman}', monospace;
  font-size: 0.92em;
  letter-spacing: 0.01em;
  text-align: center;
`,Ar=()=>{const{hasDexStats:e}=F(),{dexStats:t}=A(),{dexStatsTextColor:n,dexStatsOutline:o}=D();return e?r.jsx(Rr,{color:n,outline:o,children:t}):null},Or=m("div")`
  position: absolute;
  pointer-events: none;
  z-index: -1;
  /* Space a bit away from the borders so it's not visible outside of the card */
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  top: 4px;
  left: 4px;
  transform-style: preserve-3d;
  transform: translateZ(5px);

  /* Subtle shadowbox depth */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) brightness(0.98);
`,Nr=m(ve)`
  border-radius: 30px;
`,$r=()=>{const{imgLayer1:e}=A();return e?r.jsx(Or,{children:r.jsx(Nr,{...e})}):null},Pr=m("div")`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  transform: translateZ(15px);

  /* Top layer with enhanced depth */
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12)) brightness(1.05);
`,Dr=m(ve)`
  border-radius: 21px;
`,_r=()=>{const{imgLayer2:e}=A();return e?r.jsx(Pr,{children:r.jsx(Dr,{...e})}):null},Lr=m(Z)`
  overflow: hidden;
  top: 7.9%;
  left: 4.6%;
  width: 11%;
  height: 8%;
  border-radius: 1.3em 0.45em 1.95em;
`,Br=m("img")`
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
`,zr=()=>{const{positions:{prevolveImg:e}}=D(),{hasPrevolve:t}=F(),{prevolveImgSrc:n}=A(),{prevolveImgSrc:o}=ge(),i=S.useMemo(()=>n??o,[n,o]);return!t||!i?null:r.jsx(Lr,{...e,children:r.jsx(Br,{src:i,alt:""})})},Fr=m(z)`
  font-family: '${B.FrutigerLT66BoldItalic}', monospace;
  font-size: 1.0125em;
  letter-spacing: 0.01em;
  position: absolute;
  top: 9.7%;
  left: 17.8%;
  width: 50%;
  overflow: hidden;
`,Hr=()=>{const{prevolveName:e}=A(),{hasPrevolve:t}=F();return!t||!e?null:r.jsxs(Fr,{children:["Evolves from ",e]})},Gr=()=>r.jsx("svg",{style:{height:0,position:"absolute"},xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",children:r.jsxs("defs",{children:[r.jsxs("filter",{id:"whiteOutlineEffect",colorInterpolationFilters:"sRGB",children:[r.jsx("feMorphology",{in:"SourceAlpha",result:"MORPH",operator:"dilate",radius:"2"}),r.jsx("feColorMatrix",{in:"MORPH",result:"WHITENED",type:"matrix",values:"-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0"}),r.jsxs("feMerge",{children:[r.jsx("feMergeNode",{in:"WHITENED"}),r.jsx("feMergeNode",{in:"SourceGraphic"})]})]}),r.jsxs("filter",{id:"blackOutlineEffect",colorInterpolationFilters:"sRGB",children:[r.jsx("feMorphology",{in:"SourceAlpha",result:"MORPH",operator:"dilate",radius:"2"}),r.jsx("feColorMatrix",{in:"MORPH",result:"BLACKENED",type:"matrix",values:"1 0 0 0 -1, 0 1 0 0 -1, 0 0 1 0 -1, 0 0 0 1 0"}),r.jsxs("feMerge",{children:[r.jsx("feMergeNode",{in:"BLACKENED"}),r.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]})}),Wr=m("div")`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  position: absolute;

  ${({$custom:e,$multiple:t})=>t?M`
          gap: 0.15em;
          top: 2.5%;
          right: 4.5%;
          width: 23.5%;
          height: 6.5%;
        `:M`
          top: 2.4%;
          width: 9%;
          height: 7.5%;

          ${e?M`
                /* Single custom */
                right: 4.8%;
              `:M`
                /* Single default */
                right: 4.55%;
              `}
        `}
`,qr=m("img")`
  height: 100%;
  border-radius: 50%;
  background: white;
  object-fit: cover;
  object-position: center;

  ${({$custom:e,$multiple:t})=>t?M`
          width: 3.5em;
          height: 3.5em;

          ${e?M`
                /* Multiple custom */
                border: 3px solid white;
              `:M`
                /* Multiple default */
                border: 2px solid white;
              `}
        `:M`
          ${e?M`
                /* Single custom */
                width: 3.4em;
                height: 3.4em;
              `:M`
                /* Single default */
                width: 3.7em;
                height: 3.7em;
              `}
        `}
`,Ur=()=>{const{hasTypeImage:e,hasMultipleTypeImages:t}=F(),{typeImg:n,customTypeImgSrc:o,typeImgAmount:i}=yt(),h=S.useMemo(()=>o||(n?G.Assets.Icons.TypeBorder(n.slug):void 0),[o,n]);return!e||!h?null:r.jsx(Wr,{$multiple:t,$custom:!!o,children:new Array(t?i:1).fill(void 0).map((g,u)=>r.jsx(qr,{$multiple:t,$custom:!!o,src:h,alt:""},`${n?.slug}-${u}`))})},Vr=m("div")`
  position: relative;
  z-index: 1;
  font-size: ${({$fontSize:e})=>`${e}px`};
  height: ${({$height:e})=>`${e}px`};
  overflow: visible;
  cursor: ${({$disableParallax:e})=>e?"default":"pointer"};
  transform-style: ${({$disableParallax:e})=>e?"flat":"preserve-3d"};
  perspective: ${({$disableParallax:e})=>e?"none":"2000px"};

  /* Card with original positioning preserved */
  transform: ${({$tiltX:e,$tiltY:t,$isHovering:n,$disableParallax:o})=>o?"none":n?`rotateX(${e}deg) rotateY(${t}deg) scale3d(1.05, 1.05, 1.05) translateZ(40px)`:"rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)"};
  filter: ${({$isHovering:e,$disableParallax:t})=>t?"none":e?"brightness(1.12) contrast(1.08) saturate(1.12)":"brightness(1) contrast(1) saturate(1)"};

  /* Contained shadowbox depth shadows */
  box-shadow: ${({$tiltX:e,$tiltY:t,$isHovering:n,$showFrame:o=!0})=>o&&n?`
        /* Contained shadowbox shadow on background */
        ${t*3}px ${e*3+20}px 50px rgba(0, 0, 0, 0.35),
        ${t*2}px ${e*2+12}px 25px rgba(0, 0, 0, 0.25),
        ${t*1}px ${e*1+6}px 12px rgba(0, 0, 0, 0.2),
        
        /* Card floating above shadowbox floor */
        0 -8px 16px rgba(0, 0, 0, 0.12),
        0 -4px 8px rgba(0, 0, 0, 0.08),
        
        /* Card thickness layers */
        ${t*.8+2}px ${e*.8+5}px 0px rgba(0, 0, 0, 0.4),
        ${t*.5+1}px ${e*.5+3}px 0px rgba(0, 0, 0, 0.35),
        ${t*.3}px ${e*.3+2}px 0px rgba(0, 0, 0, 0.3),
        
        /* Shadowbox lighting from top */
        inset 0 2px 6px rgba(255, 255, 255, 0.12),
        inset 0 -1px 3px rgba(0, 0, 0, 0.04),
        
        /* Card edge highlight */
        0 0 0 1px rgba(255, 255, 255, 0.18)
      `:o?`
        /* Resting shadowbox shadows */
        0 8px 20px rgba(0, 0, 0, 0.18),
        0 4px 10px rgba(0, 0, 0, 0.12),
        0 2px 5px rgba(0, 0, 0, 0.08),
        
        /* Card thickness at rest */
        1px 3px 0px rgba(0, 0, 0, 0.25),
        1px 2px 0px rgba(0, 0, 0, 0.18),
        
        /* Subtle shadowbox lighting */
        inset 0 1px 3px rgba(255, 255, 255, 0.08)
      `:"none"};

  &,
  & * {
    transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1),
      filter 0.25s ease, box-shadow 0.25s ease;
  }

  &::before {
    /* Simple white background so the card isn't transparent */
    z-index: -10;
    content: '';
    position: absolute;
    background: white;
    border-radius: ${({$showFrame:e=!0})=>e?"30px":"0px"};
    /* Space a bit away from the borders so it's not visible outside of the card */
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    top: 4px;
    left: 4px;
    pointer-events: none;
  }

  &::after {
    /* Card rim/edge highlight for 3D effect */
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border-radius: ${({$showFrame:e=!0})=>e?"31px":"0px"};
    border: ${({$showFrame:e=!0})=>e?"1px solid rgba(255, 255, 255, 0.2)":"none"};
    pointer-events: none;
    z-index: -9;
    transform-style: preserve-3d;
    transform: ${({$showFrame:e=!0,$disableParallax:t})=>t?"none":e?"translateZ(-4px)":"none"};
  }
`,Xr=m("div")`
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  border-radius: 6px;
  background: transparent;
  transform-style: preserve-3d;
  transform: ${({$disableParallax:e})=>e?"none":"translateZ(100px)"};
  pointer-events: none;
  z-index: 200;

  /* Shadowbox frame edges */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 4px solid #2a2a2a;
    border-radius: 6px;
    box-shadow: 
      /* Frame depth shadow */ inset 0 0 0 1px #1a1a1a,
      inset 0 0 0 2px #333,
      /* Frame outer shadow */ 0 5px 15px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Frame inner bevel */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid #444;
    border-radius: 1px;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  }

  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
`,Yr=m("div")`
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 32px;
  background: transparent;
  transform-style: preserve-3d;
  transform: ${({$disableParallax:e})=>e?"none":"translateZ(90px)"};
  pointer-events: none;
  z-index: 150;

  /* Subtle glass reflection only */
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 85%;
    bottom: 85%;
    background: ${({$tiltY:e,$isHovering:t})=>t?`linear-gradient(
            ${135+e*2}deg,
            rgba(255, 255, 255, 0.25) 0%,
            transparent 70%
          )`:`linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 60%
          )`};
    border-radius: 15px;
    opacity: ${({$isHovering:e})=>e?.6:.3};
    transition: all 0.3s ease;
  }
`,Zr=m("div")`
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(248, 249, 250, 0.6) 50%,
    rgba(233, 236, 239, 0.4) 100%
  );
  border-radius: 3px;
  transform: translateZ(-80px);
  pointer-events: none;
  z-index: -30;

  /* Subtle shadowbox backing */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03),
    inset 0 2px 4px rgba(0, 0, 0, 0.02);
`,Kr=m("div")`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 30px;
  pointer-events: none;
  z-index: 50;
  opacity: ${({$isVisible:e})=>e?1:0};
  transform-style: preserve-3d;
  transform: ${({$disableParallax:e})=>e?"none":"translateZ(35px)"};
  overflow: hidden;

  /* Tilt-reactive holographic overlay */
  background: linear-gradient(
    ${({$tiltX:e,$tiltY:t})=>45+t*2+e*1.5}deg,
    rgba(255, 0, 150, 0.15) 0%,
    rgba(0, 255, 255, 0.2) 25%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(150, 0, 255, 0.2) 75%,
    rgba(255, 0, 150, 0.15) 100%
  );

  opacity: ${({$isVisible:e,$isHovering:t})=>e?t?.8:.4:0};

  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`,Jr=m("div")`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  transform-style: preserve-3d;
  transform: translateZ(30px);

  /* Subtle lighting effect on content layer */
  filter: ${({$isHovering:e,$tiltX:t=0,$tiltY:n=0})=>e?`drop-shadow(${n*.3}px ${t*.3+2}px 8px rgba(0, 0, 0, 0.15))`:"drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))"};

  /* Add subtle texture and material feel */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({$isHovering:e,$tiltY:t=0})=>e?`linear-gradient(
            ${135+t*1.5}deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            transparent 40%, 
            rgba(0, 0, 0, 0.02) 100%
          )`:"transparent"};
    border-radius: 30px;
    pointer-events: none;
    z-index: 1;
    opacity: ${({$isHovering:e})=>e?1:0};
    transition: opacity 0.3s ease;
  }
`,eo=({showFrame:e=!0,disableParallax:t=!0})=>{const[n,o]=S.useState(null),[i,{width:h}]=Et(),g=Ct(h,250),[u,c]=S.useState({x:0,y:0}),[a,y]=S.useState(!1),{rarityIcon:T}=We(),O=S.useRef({x:0,y:0}),N=S.useRef({x:0,y:0}),b=S.useRef(null),f=S.useCallback(()=>{if(b.current!==null)return;const l=()=>{const C=O.current.x,j=O.current.y,$=N.current.x+(C-N.current.x)*.12,L=N.current.y+(j-N.current.y)*.12;N.current={x:$,y:L},(Math.abs($-u.x)>.2||Math.abs(L-u.y)>.2)&&c({x:$,y:L});const d=Math.abs(C-$)<.2&&Math.abs(j-L)<.2;if(!a&&d&&Math.abs($)<.2&&Math.abs(L)<.2){b.current=null;return}b.current=requestAnimationFrame(l)};b.current=requestAnimationFrame(l)},[a,u.x,u.y]),I=S.useMemo(()=>g?g/(qe/Te):Te,[g]),k=S.useMemo(()=>g*St,[g]),w=S.useCallback(l=>{if(!n)return;const p=n.getBoundingClientRect(),C=p.left+p.width/2,j=p.top+p.height/2,$=l.clientX-C,L=l.clientY-j,d=$/(p.width/2),x=L/(p.height/2),v=.05,P=Math.abs(d)<v?0:d,q=Math.abs(x)<v?0:x,V=(nt,rt,ot)=>Math.min(ot,Math.max(rt,nt)),K=Math.sign(P)*Math.pow(Math.abs(P),.6),ne=Math.sign(q)*Math.pow(Math.abs(q),.6),U=14,et=V(K*U,-U,U),tt=V(ne*-U,-U,U);O.current={x:tt,y:et},f()},[n,f]),R=S.useCallback(()=>{y(!0),f()},[f]),_=S.useCallback(()=>{y(!1),O.current={x:0,y:0},f()},[f]);S.useEffect(()=>()=>{b.current!==null&&cancelAnimationFrame(b.current)},[]);const s=S.useCallback(l=>{o(l),i(l)},[i]);return r.jsxs(Vr,{id:Tt,$fontSize:I,$height:k,$tiltX:u.x,$tiltY:u.y,$isHovering:a,$showFrame:e,$disableParallax:t,ref:s,onMouseMove:t?void 0:w,onMouseEnter:t?void 0:R,onMouseLeave:t?void 0:_,children:[e&&r.jsx(Zr,{$isHovering:a}),e&&r.jsx(Xr,{$tiltX:u.x,$tiltY:u.y,$isHovering:a,$disableParallax:t}),e&&r.jsx(Yr,{$tiltX:u.x,$tiltY:u.y,$isHovering:a,$disableParallax:t}),T&&r.jsx(Kr,{$isVisible:!!T,$tiltX:u.x,$tiltY:u.y,$isHovering:a,$disableParallax:t}),r.jsx(sn,{}),r.jsx(Gr,{}),r.jsxs(Jr,{$tiltX:u.x,$tiltY:u.y,$isHovering:a,children:[r.jsx(Wn,{}),r.jsx(Xn,{}),r.jsx(Hr,{}),r.jsx(zr,{}),r.jsx(Ur,{}),r.jsx(Ar,{}),r.jsx(Dn,{}),r.jsx(Mr,{}),r.jsx(dr,{}),r.jsx(rn,{})]}),r.jsx(Cr,{}),r.jsx($r,{}),r.jsx(Ir,{}),r.jsx(_r,{})]})};export{eo as C,B as F,bt as a,yt as b,qe as c,ae as d,We as e,mt as f,gt as g,ge as h,Tt as i,xt as j,vt as k,D as l,F as u};
