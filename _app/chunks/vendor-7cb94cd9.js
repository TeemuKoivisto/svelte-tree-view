function _(){}function F(t,n){for(const e in n)t[e]=n[e];return t}function L(t){return t()}function T(){return Object.create(null)}function m(t){t.forEach(L)}function H(t){return typeof t=="function"}function I(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function P(t){return Object.keys(t).length===0}function q(t,...n){if(t==null)return _;const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function ot(t){let n;return q(t,e=>n=e)(),n}function st(t,n,e){t.$$.on_destroy.push(q(n,e))}function lt(t,n,e,i){if(t){const c=z(t,n,e,i);return t[0](c)}}function z(t,n,e,i){return t[1]&&i?F(e.ctx.slice(),t[1](i(n))):e.ctx}function ft(t,n,e,i){if(t[2]&&i){const c=t[2](i(e));if(n.dirty===void 0)return c;if(typeof c=="object"){const l=[],u=Math.max(n.dirty.length,c.length);for(let o=0;o<u;o+=1)l[o]=n.dirty[o]|c[o];return l}return n.dirty|c}return n.dirty}function at(t,n,e,i,c,l){if(c){const u=z(n,e,i,l);t.p(u,c)}}function dt(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let i=0;i<e;i++)n[i]=-1;return n}return-1}function _t(t){const n={};for(const e in t)e[0]!=="$"&&(n[e]=t[e]);return n}function ht(t){return t==null?"":t}let y=!1;function W(){y=!0}function G(){y=!1}function J(t,n,e,i){for(;t<n;){const c=t+(n-t>>1);e(c)<=i?t=c+1:n=c}return t}function K(t){if(t.hydrate_init)return;t.hydrate_init=!0;let n=t.childNodes;if(t.nodeName==="HEAD"){const r=[];for(let s=0;s<n.length;s++){const a=n[s];a.claim_order!==void 0&&r.push(a)}n=r}const e=new Int32Array(n.length+1),i=new Int32Array(n.length);e[0]=-1;let c=0;for(let r=0;r<n.length;r++){const s=n[r].claim_order,a=(c>0&&n[e[c]].claim_order<=s?c+1:J(1,c,g=>n[e[g]].claim_order,s))-1;i[r]=e[a]+1;const f=a+1;e[f]=r,c=Math.max(f,c)}const l=[],u=[];let o=n.length-1;for(let r=e[c]+1;r!=0;r=i[r-1]){for(l.push(n[r-1]);o>=r;o--)u.push(n[o]);o--}for(;o>=0;o--)u.push(n[o]);l.reverse(),u.sort((r,s)=>r.claim_order-s.claim_order);for(let r=0,s=0;r<u.length;r++){for(;s<l.length&&u[r].claim_order>=l[s].claim_order;)s++;const a=s<l.length?l[s]:null;t.insertBefore(u[r],a)}}function Q(t,n){if(y){for(K(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;n!==t.actual_end_child?(n.claim_order!==void 0||n.parentNode!==t)&&t.insertBefore(n,t.actual_end_child):t.actual_end_child=n.nextSibling}else(n.parentNode!==t||n.nextSibling!==null)&&t.appendChild(n)}function mt(t,n,e){y&&!e?Q(t,n):(n.parentNode!==t||n.nextSibling!=e)&&t.insertBefore(n,e||null)}function R(t){t.parentNode.removeChild(t)}function pt(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function U(t){return document.createElement(t)}function k(t){return document.createTextNode(t)}function gt(){return k(" ")}function yt(){return k("")}function bt(t,n,e,i){return t.addEventListener(n,e,i),()=>t.removeEventListener(n,e,i)}function xt(t,n,e){e==null?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function V(t){return Array.from(t.childNodes)}function X(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function B(t,n,e,i,c=!1){X(t);const l=(()=>{for(let u=t.claim_info.last_index;u<t.length;u++){const o=t[u];if(n(o)){const r=e(o);return r===void 0?t.splice(u,1):t[u]=r,c||(t.claim_info.last_index=u),o}}for(let u=t.claim_info.last_index-1;u>=0;u--){const o=t[u];if(n(o)){const r=e(o);return r===void 0?t.splice(u,1):t[u]=r,c?r===void 0&&t.claim_info.last_index--:t.claim_info.last_index=u,o}}return i()})();return l.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,l}function Y(t,n,e,i){return B(t,c=>c.nodeName===n,c=>{const l=[];for(let u=0;u<c.attributes.length;u++){const o=c.attributes[u];e[o.name]||l.push(o.name)}l.forEach(u=>c.removeAttribute(u))},()=>i(n))}function $t(t,n,e){return Y(t,n,e,U)}function Z(t,n){return B(t,e=>e.nodeType===3,e=>{const i=""+n;if(e.data.startsWith(i)){if(e.data.length!==i.length)return e.splitText(i.length)}else e.data=i},()=>k(n),!0)}function wt(t){return Z(t," ")}function Et(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function kt(t,n){t.value=n==null?"":n}function jt(t,n,e){t.classList[e?"add":"remove"](n)}let b;function x(t){b=t}function $(){if(!b)throw new Error("Function called outside component initialization");return b}function Nt(t){$().$$.on_mount.push(t)}function St(t){$().$$.after_update.push(t)}function At(t,n){$().$$.context.set(t,n)}function Ct(t){return $().$$.context.get(t)}const p=[],O=[],w=[],j=[],tt=Promise.resolve();let N=!1;function nt(){N||(N=!0,tt.then(D))}function S(t){w.push(t)}function vt(t){j.push(t)}let A=!1;const C=new Set;function D(){if(!A){A=!0;do{for(let t=0;t<p.length;t+=1){const n=p[t];x(n),et(n.$$)}for(x(null),p.length=0;O.length;)O.pop()();for(let t=0;t<w.length;t+=1){const n=w[t];C.has(n)||(C.add(n),n())}w.length=0}while(p.length);for(;j.length;)j.pop()();N=!1,A=!1,C.clear()}}function et(t){if(t.fragment!==null){t.update(),m(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(S)}}const E=new Set;let d;function Mt(){d={r:0,c:[],p:d}}function Lt(){d.r||m(d.c),d=d.p}function it(t,n){t&&t.i&&(E.delete(t),t.i(n))}function Tt(t,n,e,i){if(t&&t.o){if(E.has(t))return;E.add(t),d.c.push(()=>{E.delete(t),i&&(e&&t.d(1),i())}),t.o(n)}}function qt(t,n){const e={},i={},c={$$scope:1};let l=t.length;for(;l--;){const u=t[l],o=n[l];if(o){for(const r in u)r in o||(i[r]=1);for(const r in o)c[r]||(e[r]=o[r],c[r]=1);t[l]=o}else for(const r in u)c[r]=1}for(const u in i)u in e||(e[u]=void 0);return e}function zt(t){return typeof t=="object"&&t!==null?t:{}}function Bt(t,n,e){const i=t.$$.props[n];i!==void 0&&(t.$$.bound[i]=e,e(t.$$.ctx[i]))}function Ot(t){t&&t.c()}function Dt(t,n){t&&t.l(n)}function rt(t,n,e,i){const{fragment:c,on_mount:l,on_destroy:u,after_update:o}=t.$$;c&&c.m(n,e),i||S(()=>{const r=l.map(L).filter(H);u?u.push(...r):m(r),t.$$.on_mount=[]}),o.forEach(S)}function ct(t,n){const e=t.$$;e.fragment!==null&&(m(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function ut(t,n){t.$$.dirty[0]===-1&&(p.push(t),nt(),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function Ft(t,n,e,i,c,l,u,o=[-1]){const r=b;x(t);const s=t.$$={fragment:null,ctx:null,props:l,update:_,not_equal:c,bound:T(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r?r.$$.context:n.context||[]),callbacks:T(),dirty:o,skip_bound:!1,root:n.target||r.$$.root};u&&u(s.root);let a=!1;if(s.ctx=e?e(t,n.props||{},(f,g,...v)=>{const M=v.length?v[0]:g;return s.ctx&&c(s.ctx[f],s.ctx[f]=M)&&(!s.skip_bound&&s.bound[f]&&s.bound[f](M),a&&ut(t,f)),g}):[],s.update(),a=!0,m(s.before_update),s.fragment=i?i(s.ctx):!1,n.target){if(n.hydrate){W();const f=V(n.target);s.fragment&&s.fragment.l(f),f.forEach(R)}else s.fragment&&s.fragment.c();n.intro&&it(t.$$.fragment),rt(t,n.target,n.anchor,n.customElement),G(),D()}x(r)}class Ht{$destroy(){ct(this,1),this.$destroy=_}$on(n,e){const i=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return i.push(e),()=>{const c=i.indexOf(e);c!==-1&&i.splice(c,1)}}$set(n){this.$$set&&!P(n)&&(this.$$.skip_bound=!0,this.$$set(n),this.$$.skip_bound=!1)}}const h=[];function It(t,n=_){let e;const i=new Set;function c(o){if(I(t,o)&&(t=o,e)){const r=!h.length;for(const s of i)s[1](),h.push(s,t);if(r){for(let s=0;s<h.length;s+=2)h[s][0](h[s+1]);h.length=0}}}function l(o){c(o(t))}function u(o,r=_){const s=[o,r];return i.add(s),i.size===1&&(e=n(c)||_),o(t),()=>{i.delete(s),i.size===0&&(e(),e=null)}}return{set:c,update:l,subscribe:u}}export{Nt as A,F as B,It as C,lt as D,at as E,dt as F,ft as G,Q as H,_ as I,ot as J,ht as K,bt as L,pt as M,jt as N,m as O,Ct as P,st as Q,_t as R,Ht as S,O as T,kt as U,Bt as V,vt as W,V as a,xt as b,$t as c,R as d,U as e,mt as f,Z as g,Et as h,Ft as i,Ot as j,gt as k,yt as l,Dt as m,wt as n,rt as o,qt as p,zt as q,Mt as r,I as s,k as t,Tt as u,ct as v,Lt as w,it as x,At as y,St as z};
