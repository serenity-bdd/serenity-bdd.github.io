"use strict";(self.webpackChunkserenity_users_guide=self.webpackChunkserenity_users_guide||[]).push([[6561],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>k});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=c(r),k=i,m=d["".concat(l,".").concat(k)]||d[k]||u[k]||a;return r?n.createElement(m,o(o({ref:t},p),{},{components:r})):n.createElement(m,o({ref:t},p))}));function k(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,o[1]=s;for(var c=2;c<a;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},5788:(e,t,r)=>{r.r(t),r.d(t,{contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>s,toc:()=>l});var n=r(7462),i=(r(7294),r(3905));const a={id:"browserstack",title:"BrowserStack",sidebar_position:3},o="Introduction",s={unversionedId:"cloud/browserstack",id:"cloud/browserstack",isDocsHomePage:!1,title:"BrowserStack",description:"Browserstack is an online platform that allows you to run cross-browser tests in parallel at scale. In this section, we will see how it integrates with Serenity.",source:"@site/docs/cloud/browserstack.md",sourceDirName:"cloud",slug:"/cloud/browserstack",permalink:"/docs/cloud/browserstack",editUrl:"https://github.com/serenity-bdd/serenity-bdd.github.io/blob/master/docs/cloud/browserstack.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{id:"browserstack",title:"BrowserStack",sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"LambdaTest",permalink:"/docs/cloud/lambdatest"},next:{title:"SauceLabs",permalink:"/docs/cloud/saucelabs"}},l=[{value:"Adding the Browserstack plugin to your project",id:"adding-the-browserstack-plugin-to-your-project",children:[]},{value:"Specifying your BrowserStack credentials and grid URL",id:"specifying-your-browserstack-credentials-and-grid-url",children:[]},{value:"Configuring the BrowserStack driver",id:"configuring-the-browserstack-driver",children:[]},{value:"Activating the BrowserStack plugin",id:"activating-the-browserstack-plugin",children:[]},{value:"Defining BrowserStack Capabilities",id:"defining-browserstack-capabilities",children:[]}],c={toc:l};function p(e){let{components:t,...r}=e;return(0,i.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"introduction"},"Introduction"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://www.browserstack.com/"},"Browserstack")," is an online platform that allows you to run cross-browser tests in parallel at scale. In this section, we will see how it integrates with Serenity."),(0,i.kt)("h2",{id:"adding-the-browserstack-plugin-to-your-project"},"Adding the Browserstack plugin to your project"),(0,i.kt)("p",null,"Serenity comes with a dedicated BrowserStack plugin that makes it much easier to run your tests on this platform. To use it, first add the ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity-browserstack")," dependency to your project. In Maven, that would look like the following:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"        <dependency>\n            <groupId>net.serenity-bdd</groupId>\n            <artifactId>serenity-browserstack</artifactId>\n            <version>${serenity.version}</version>\n        </dependency>\n")),(0,i.kt)("p",null,"Or in Gradle:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-groovy"},'    testImplementation "net.serenity-bdd:serenity-browserstack:${serenityVersion}"\n')),(0,i.kt)("h2",{id:"specifying-your-browserstack-credentials-and-grid-url"},"Specifying your BrowserStack credentials and grid URL"),(0,i.kt)("p",null,"Next, you will need a ",(0,i.kt)("a",{parentName:"p",href:"https://www.browserstack.com/pricing"},"BrowserStack account"),". "),(0,i.kt)("p",null,"You can add your ",(0,i.kt)("a",{parentName:"p",href:"https://www.browserstack.com/accounts/settings"},"BrowserStack credentials")," in two ways. The simplest is to define the following system properties:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"BROWSERSTACK_USER")," - BrowserStack user name"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"BROWSERSTACK_KEY"),"- BrowserStack access key")),(0,i.kt)("p",null,"Alternatively, you can define your username and accesskey using the ",(0,i.kt)("inlineCode",{parentName:"p"},"lt.user")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"lt.key")," properties respectively in your ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity.conf")," file:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-hocon"},"browserstack.user=myuser\nbrowserstack.key=XXXXXXXX\n")),(0,i.kt)("h2",{id:"configuring-the-browserstack-driver"},"Configuring the BrowserStack driver"),(0,i.kt)("p",null,"Serenity interacts with LambdaTest via the ",(0,i.kt)("inlineCode",{parentName:"p"},"RemoteDriver")," driver. You can specify the remote URL explicitly, or let the ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity-browserstack")," library do it for you. For example, to configure the URL explicitly you could use a ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity.conf")," configuration like this:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-hocon"},'webdriver {\n  driver = remote\n  remote.url =\n  "https://"${BROWSERSTACK_USER}":"${BROWSERSTACK_KEY}"@hub.browserstack.com/wd/hub"\n}\n')),(0,i.kt)("p",null,"If the ",(0,i.kt)("inlineCode",{parentName:"p"},"webdriver.remote.url")," property is not defined, Serenity will use these values to build one for you if the BrowserStack plugin is active (see below)."),(0,i.kt)("h2",{id:"activating-the-browserstack-plugin"},"Activating the BrowserStack plugin"),(0,i.kt)("p",null,"The Serenity BrowserStack plugin will be invoked if Serenity can find a ",(0,i.kt)("inlineCode",{parentName:"p"},'"bstack:options"')," section in your ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity.conf")," file, or if you specify a ",(0,i.kt)("inlineCode",{parentName:"p"},"remote.webdriver.url")," that points to a LambdaTest server. If you have no LambdaTest-specific capabilities, simply set the ",(0,i.kt)("inlineCode",{parentName:"p"},"browserstack.active")," property to true like this:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-hocon"},"browserstack {\n  active = true\n}\n")),(0,i.kt)("h2",{id:"defining-browserstack-capabilities"},"Defining BrowserStack Capabilities"),(0,i.kt)("p",null,"You can specify the operating system and browser you want to run your tests on by customising the ",(0,i.kt)("a",{parentName:"p",href:"https://www.browserstack.com/automate/capabilities"},"Selenium Capabilities")," in your ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity.conf")," file. You do this in the ",(0,i.kt)("inlineCode",{parentName:"p"},'"bstack:options"')," section of the ",(0,i.kt)("inlineCode",{parentName:"p"},"serenity.conf")," file, e.g."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-hocon"},'    webdriver {\n      driver = "remote"\n      capabilities {\n        browserName = "Chrome"\n        browserVersion = "latest"\n        "bstack:options" {\n          os = "Windows"\n          osVersion = "11"\n          resolution = "1920x1200"\n          seleniumVersion = "4.1.2"\n          video = true\n        }\n      }\n    }\n')),(0,i.kt)("p",null,"The LambdaTest test name will be assigned automatically. You can also set the ",(0,i.kt)("em",{parentName:"p"},"build")," name by assigning the ",(0,i.kt)("inlineCode",{parentName:"p"},"lambdatest.build")," property.\nFor example the following example shows how to create a build name from the Jenkins job name and build number environment variables:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-hocon"},'lambdatest {\n  build = "${JOB_NAME} - build ${BUILD_NUMBER}"\n}\n')),(0,i.kt)("p",null,"These properties will be placed in the ",(0,i.kt)("inlineCode",{parentName:"p"},"bstack:options")," capability."))}p.isMDXComponent=!0}}]);