import{n as l,s as v,j as m,r as k,q as x}from"./scheduler.7fe4e337.js";const c=[];function z(e,o){return{subscribe:A(e,o).subscribe}}function A(e,o=l){let r;const n=new Set;function u(t){if(v(e,t)&&(e=t,r)){const i=!c.length;for(const s of n)s[1](),c.push(s,e);if(i){for(let s=0;s<c.length;s+=2)c[s][0](c[s+1]);c.length=0}}}function b(t){u(t(e))}function f(t,i=l){const s=[t,i];return n.add(s),n.size===1&&(r=o(u,b)||l),t(e),()=>{n.delete(s),n.size===0&&r&&(r(),r=null)}}return{set:u,update:b,subscribe:f}}function B(e,o,r){const n=!Array.isArray(e),u=n?[e]:e;if(!u.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const b=o.length<2;return z(r,(f,t)=>{let i=!1;const s=[];let d=0,p=l;const h=()=>{if(d)return;p();const a=o(n?s[0]:s,f,t);b?f(a):p=x(a)?a:l},w=u.map((a,_)=>m(a,q=>{s[_]=q,d&=~(1<<_),i&&h()},()=>{d|=1<<_}));return i=!0,h(),function(){k(w),p(),i=!1}})}var g;const T=((g=globalThis.__sveltekit_1suphdn)==null?void 0:g.base)??"/svelte-tree-view";var y;const E=((y=globalThis.__sveltekit_1suphdn)==null?void 0:y.assets)??T;export{E as a,T as b,B as d,A as w};
