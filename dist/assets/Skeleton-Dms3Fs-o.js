import{m as y,n as w,d as R,o as _,_ as U,p as o,j as $,q as M,s as S,t as j,aL as A,aM as N,aN as X,ax as u,l as b}from"./index-EsxPKsM0.js";function B(a){return y("MuiSkeleton",a)}w("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const E=["animation","className","component","height","style","variant","width"];let r=a=>a,p,g,m,f;const K=a=>{const{classes:t,variant:e,animation:i,hasChildren:s,width:l,height:n}=a;return S({root:["root",e,i,s&&"withChildren",s&&!l&&"fitContent",s&&!n&&"heightAuto"]},B,t)},L=b(p||(p=r`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),P=b(g||(g=r`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),W=j("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(a,t)=>{const{ownerState:e}=a;return[t.root,t[e.variant],e.animation!==!1&&t[e.animation],e.hasChildren&&t.withChildren,e.hasChildren&&!e.width&&t.fitContent,e.hasChildren&&!e.height&&t.heightAuto]}})(({theme:a,ownerState:t})=>{const e=A(a.shape.borderRadius)||"px",i=N(a.shape.borderRadius);return o({display:"block",backgroundColor:a.vars?a.vars.palette.Skeleton.bg:X(a.palette.text.primary,a.palette.mode==="light"?.11:.13),height:"1.2em"},t.variant==="text"&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${i}${e}/${Math.round(i/.6*10)/10}${e}`,"&:empty:before":{content:'"\\00a0"'}},t.variant==="circular"&&{borderRadius:"50%"},t.variant==="rounded"&&{borderRadius:(a.vars||a).shape.borderRadius},t.hasChildren&&{"& > *":{visibility:"hidden"}},t.hasChildren&&!t.width&&{maxWidth:"fit-content"},t.hasChildren&&!t.height&&{height:"auto"})},({ownerState:a})=>a.animation==="pulse"&&u(m||(m=r`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),L),({ownerState:a,theme:t})=>a.animation==="wave"&&u(f||(f=r`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${0},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),P,(t.vars||t).palette.action.hover)),D=R.forwardRef(function(t,e){const i=_({props:t,name:"MuiSkeleton"}),{animation:s="pulse",className:l,component:n="span",height:d,style:v,variant:C="text",width:k}=i,h=U(i,E),c=o({},i,{animation:s,component:n,variant:C,hasChildren:!!h.children}),x=K(c);return $.jsx(W,o({as:n,ref:e,className:M(x.root,l),ownerState:c},h,{style:o({width:k,height:d},v)}))});export{D as S};
