function k(){}function w(t,n){for(const e in n)t[e]=n[e];return t}function j(t){return t()}function z(){return Object.create(null)}function E(t){t.forEach(j)}function M(t){return typeof t=="function"}function A(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function B(t){return Object.keys(t).length===0}function y(t,...n){if(t==null){for(const o of n)o(void 0);return k}const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function D(t){let n;return y(t,e=>n=e)(),n}function F(t,n,e){t.$$.on_destroy.push(y(n,e))}function P(t,n,e,o){if(t){const r=m(t,n,e,o);return t[0](r)}}function m(t,n,e,o){return t[1]&&o?w(e.ctx.slice(),t[1](o(n))):e.ctx}function S(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(n.dirty===void 0)return r;if(typeof r=="object"){const a=[],_=Math.max(n.dirty.length,r.length);for(let s=0;s<_;s+=1)a[s]=n.dirty[s]|r[s];return a}return n.dirty|r}return n.dirty}function U(t,n,e,o,r,a){if(r){const _=m(n,e,o,a);t.p(_,r)}}function G(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let o=0;o<e;o++)n[o]=-1;return n}return-1}function H(t){const n={};for(const e in t)e[0]!=="$"&&(n[e]=t[e]);return n}function I(t){return t??""}let i;function d(t){i=t}function f(){if(!i)throw new Error("Function called outside component initialization");return i}function J(t){f().$$.on_mount.push(t)}function K(t){f().$$.after_update.push(t)}function L(t,n){return f().$$.context.set(t,n),n}function N(t){return f().$$.context.get(t)}const l=[],b=[];let u=[];const p=[],x=Promise.resolve();let g=!1;function v(){g||(g=!0,x.then(O))}function Q(){return v(),x}function C(t){u.push(t)}function R(t){p.push(t)}const h=new Set;let c=0;function O(){if(c!==0)return;const t=i;do{try{for(;c<l.length;){const n=l[c];c++,d(n),q(n.$$)}}catch(n){throw l.length=0,c=0,n}for(d(null),l.length=0,c=0;b.length;)b.pop()();for(let n=0;n<u.length;n+=1){const e=u[n];h.has(e)||(h.add(e),e())}u.length=0}while(l.length);for(;p.length;)p.pop()();g=!1,h.clear(),d(t)}function q(t){if(t.fragment!==null){t.update(),E(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(C)}}function T(t){const n=[],e=[];u.forEach(o=>t.indexOf(o)===-1?n.push(o):e.push(o)),e.forEach(o=>o()),u=n}export{i as A,d as B,j as C,l as D,v as E,K as a,b,P as c,S as d,F as e,D as f,G as g,N as h,I as i,y as j,L as k,w as l,H as m,k as n,J as o,R as p,M as q,E as r,A as s,Q as t,U as u,z as v,O as w,B as x,C as y,T as z};
