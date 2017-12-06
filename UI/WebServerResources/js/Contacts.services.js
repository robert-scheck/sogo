!function(){"use strict";function t(e){if("function"!=typeof e.then)if(this.init(e),this.name&&!this.id){var i=t.$$resource.create("createFolder",this.name);this.$unwrap(i),this.acls={objectEditor:1,objectCreator:1,objectEraser:1}}else this.id&&(this.$acl=new t.$$Acl("Contacts/"+this.id));else this.$unwrap(e)}t.$factory=["$q","$timeout","$log","sgSettings","sgAddressBook_PRELOAD","Resource","Card","Acl","Preferences",function(e,i,r,s,n,a,o,d,u){return angular.extend(t,{$q:e,$timeout:i,$log:r,PRELOAD:n,$$resource:new a(s.activeUser("folderURL")+"Contacts",s.activeUser()),$Card:o,$$Acl:d,$Preferences:u,$query:{value:"",sort:"c_cn",asc:1},activeUser:s.activeUser(),selectedFolder:null,$refreshTimeout:null}),u.settings.Contact.SortingState&&(t.$query.sort=u.settings.Contact.SortingState[0],t.$query.asc=parseInt(u.settings.Contact.SortingState[1])),t}];try{angular.module("SOGo.ContactsUI")}catch(t){angular.module("SOGo.ContactsUI",["SOGo.Common","SOGo.PreferencesUI"])}angular.module("SOGo.ContactsUI").constant("sgAddressBook_PRELOAD",{LOOKAHEAD:50,SIZE:100}).factory("AddressBook",t.$factory),t.$filterAll=function(e,i,r){var s={search:e};return e?(angular.isUndefined(t.$cards)&&(t.$cards=[]),angular.extend(s,i),t.$$resource.fetch(null,"allContactSearch",s).then(function(i){var s,n,a,o=function(t){return this.id==t.id};for(s=r?_.filter(i.contacts,function(t){return _.isUndefined(_.find(r,_.bind(o,t)))}):i.contacts,a=t.$cards.length-1;a>=0;a--)n=t.$cards[a],_.isUndefined(_.find(s,_.bind(o,n)))&&t.$cards.splice(a,1);return _.forEach(s,function(i,r){if(_.isUndefined(_.find(t.$cards,_.bind(o,i)))){var s=new t.$Card(_.mapKeys(i,function(t,e){return e.toLowerCase()}),e);t.$cards.splice(r,0,s)}}),t.$log.debug(t.$cards),t.$cards})):(t.$cards=[],t.$q.when(t.$cards))},t.$add=function(t){var e,i,r;e=t.isSubscription?this.$subscriptions:this.$addressbooks,r=(i=_.find(e,function(e){return"personal"==t.id||"personal"!=e.id&&1===e.name.localeCompare(t.name)}))?_.indexOf(_.map(e,"id"),i.id):1,e.splice(r,0,t)},t.$findAll=function(e){var i=this;return e&&(this.$addressbooks=[],this.$subscriptions=[],this.$remotes=[],angular.forEach(e,function(e,r){var s=new t(e);s.isRemote?i.$remotes.push(s):s.isSubscription?i.$subscriptions.push(s):i.$addressbooks.push(s)})),_.union(this.$addressbooks,this.$subscriptions,this.$remotes)},t.$subscribe=function(e,i){var r=this;return t.$$resource.userResource(e).fetch(i,"subscribe").then(function(e){var i=new t(e);return _.isUndefined(_.find(r.$subscriptions,function(t){return t.id==e.id}))&&t.$add(i),i})},t.$reloadAll=function(){var e=this;return t.$$resource.fetch("addressbooksList").then(function(i){_.forEach(i.addressbooks,function(i){var r,s;r=i.isRemote?e.$remotes:i.owner!=t.activeUser.login?e.$subscriptions:e.$addressbooks,(s=_.find(r,function(t){return t.id==i.id}))&&s.init(i)})})},t.prototype.init=function(e,i){var r=this;this.$$cards||(this.$$cards=[]),this.idsMap={},this.$cards=[],angular.forEach(e,function(t,e){"headers"!=e&&"cards"!=e&&(r[e]=t)}),this.isOwned=t.activeUser.isSuperUser||this.owner==t.activeUser.login,this.isSubscription=!this.isRemote&&this.owner!=t.activeUser.login},t.prototype.$id=function(){return this.id?t.$q.when(this.id):this.$futureAddressBookData.then(function(t){return t.id})},t.prototype.getLength=function(){return this.$cards.length},t.prototype.getItemAtIndex=function(t){var e;return!this.$isLoading&&t>=0&&t<this.$cards.length&&(e=this.$cards[t],this.$lastVisibleIndex=Math.max(0,t-3),this.$loadCard(e))?e:null},t.prototype.$loadCard=function(e){var i,r,s,n,a=e.id,o=this.idsMap[a],d=this.$cards.length,u=!1;if(angular.isUndefined(this.ids)&&e.id)u=!0;else if(angular.isDefined(o)&&o<this.$cards.length&&(e.$loaded!=t.$Card.STATUS.NOT_LOADED&&(u=!0),i=Math.min(o+t.PRELOAD.LOOKAHEAD,d-1),this.$cards[i].$loaded!=t.$Card.STATUS.NOT_LOADED?(r=Math.max(o-t.PRELOAD.LOOKAHEAD,0),this.$cards[r].$loaded!=t.$Card.STATUS.LOADED&&(i=o,o=Math.max(o-t.PRELOAD.SIZE,0))):i=Math.min(o+t.PRELOAD.SIZE,d-1),this.$cards[o].$loaded==t.$Card.STATUS.NOT_LOADED||this.$cards[i].$loaded==t.$Card.STATUS.NOT_LOADED)){for(s=[];o<i&&o<d;o++)this.$cards[o].$loaded!=t.$Card.STATUS.NOT_LOADED?i++:(s.push(this.$cards[o].id),this.$cards[o].$loaded=t.$Card.STATUS.LOADING);t.$log.debug("Loading Ids "+s.join(" ")+" ("+s.length+" cards)"),s.length>0&&(n=t.$$resource.post(this.id,"headers",{ids:s}),this.$unwrapHeaders(n))}return u},t.prototype.hasSelectedCard=function(){return angular.isDefined(this.selectedCard)},t.prototype.isSelectedCard=function(t){return this.hasSelectedCard()&&this.selectedCard==t},t.prototype.$selectedCard=function(){var t=this;return _.find(this.$cards,function(e){return e.id==t.selectedCard})},t.prototype.$selectedCardIndex=function(){return _.indexOf(_.map(this.$cards,"id"),this.selectedCard)},t.prototype.$selectedCards=function(){return _.filter(this.$cards,function(t){return t.selected})},t.prototype.$selectedCount=function(){var t;return t=0,this.$cards&&(t=_.filter(this.$cards,function(t){return t.selected}).length),t},t.prototype.$startRefreshTimeout=function(){t.$refreshTimeout&&t.$timeout.cancel(t.$refreshTimeout);var e=t.$Preferences.defaults.SOGoRefreshViewCheck;if(e&&"manually"!=e){var i=angular.bind(this,t.prototype.$reload);t.$refreshTimeout=t.$timeout(i,1e3*e.timeInterval())}},t.prototype.$reload=function(){return this.$startRefreshTimeout(),this.$filter()},t.prototype.$filter=function(e,i,r){var s,n=this,a=i&&i.dry;return a?s={value:"",sort:"c_cn",asc:1}:(this.$isLoading=!0,s=t.$query,this.isRemote||(s.partial=1)),i&&(angular.extend(s,i),a&&!e)?(n.$$cards=[],t.$q.when(n.$$cards)):(angular.isDefined(e)&&(s.value=e),n.$id().then(function(i){var o=t.$$resource.post(i,"view",s);return a?o.then(function(s){var a,o,d,u,c,h=n.$$cards,l=function(t){return this==t.id};for(s.headers&&(u=_.invokeMap(s.headers[0],"toLowerCase"),c=u.indexOf("id"),s.headers.splice(0,1),a=_.map(s.headers,function(t){return t[c]})),s.ids&&(a=r?_.filter(s.ids,function(t){return _.isUndefined(_.find(r,_.bind(l,t)))}):s.ids),d=h.length-1;d>=0;d--)o=h[d],_.isUndefined(_.find(a,_.bind(l,o.id)))&&h.splice(d,1);return _.forEach(a,function(r,s){if(_.isUndefined(_.find(h,_.bind(l,r)))){var n=new t.$Card({pid:i,id:r},e);h.splice(s,0,n)}}),_.forEach(a,function(t,e){var i,r;h[e].id!=t&&(i=_.findIndex(h,_.bind(l,t)),r=h.splice(i,1),h.splice(e,0,r[0]))}),_.forEach(s.headers,function(t){var i,r=_.findIndex(h,_.bind(l,t[c]));r>-1&&(i=_.zipObject(u,t),h[r].init(i,e))}),h}):n.$unwrap(o)}))},t.prototype.$rename=function(e){var i,r;return r=this.isSubscription?t.$subscriptions:t.$addressbooks,i=_.indexOf(_.map(r,"id"),this.id),this.name=e,r.splice(i,1),t.$add(this),this.$save()},t.prototype.$delete=function(){var e,i,r=this,s=t.$q.defer();return this.isSubscription?(i=t.$$resource.fetch(this.id,"unsubscribe"),e=t.$subscriptions):(i=t.$$resource.remove(this.id),e=t.$addressbooks),i.then(function(){var t=_.indexOf(_.map(e,"id"),r.id);e.splice(t,1),s.resolve()},s.reject),s.promise},t.prototype.$_deleteCards=function(t){var e=this;_.forEachRight(this.$cards,function(i,r){var s=_.findIndex(t,function(t){return i.id==t});s>-1?(t.splice(s,1),delete e.idsMap[i.id],e.isSelectedCard(i.id)&&delete e.selectedCard,e.$cards.splice(r,1)):e.idsMap[i.id]-=t.length})},t.prototype.$deleteCards=function(e){var i=this,r=_.map(e,"id");return t.$$resource.post(this.id,"batchDelete",{uids:r}).then(function(){i.$_deleteCards(r)})},t.prototype.$copyCards=function(e,i){var r=_.map(e,"id");return t.$$resource.post(this.id,"copy",{uids:r,folder:i})},t.prototype.$moveCards=function(e,i){var r,s=this;return r=_.map(e,"id"),t.$$resource.post(this.id,"move",{uids:r,folder:i}).then(function(){return s.$_deleteCards(r)})},t.prototype.$save=function(){return t.$$resource.save(this.id,this.$omit()).then(function(t){return t})},t.prototype.exportCards=function(e){var i,r,s=null;return i={type:"application/octet-stream",filename:this.name+".ldif"},e&&(r=_.filter(this.$cards,function(t){return t.selected}),s={uids:_.map(r,"id")}),t.$$resource.download(this.id,"export",s,i)},t.prototype.$unwrap=function(e){var i=this;this.$isLoading=!0,this.$futureAddressBookData=e.then(function(e){return t.$timeout(function(){var r;return(!e.ids||i.$topIndex>e.ids.length-1)&&(i.$topIndex=0),angular.forEach(t.$findAll(),function(t,r){t.id==e.id&&angular.extend(i,t)}),i.init(e),i.ids&&(t.$log.debug("unwrapping "+i.ids.length+" cards"),_.reduce(i.ids,function(e,r,s){var n={pid:i.id,id:r};return i.idsMap[n.id]=s,e.push(new t.$Card(n)),e},i.$cards)),e.headers&&(r=_.invokeMap(e.headers[0],"toLowerCase"),e.headers.splice(0,1),i.ids?_.forEach(e.headers,function(t){var e=_.zipObject(r,t),s=i.idsMap[e.id];i.$cards[s].init(e)}):(i.$cards=[],angular.forEach(e.headers,function(e){var s=_.zipObject(r,e);angular.extend(s,{pid:i.id}),i.$cards.push(new t.$Card(s))}))),i.$acl=new t.$$Acl("Contacts/"+i.id),i.$startRefreshTimeout(),i.$isLoading=!1,t.$log.debug("addressbook "+i.id+" ready"),i})},function(e){i.isError=!0,angular.isObject(e)&&t.$timeout(function(){angular.extend(i,e)})})},t.prototype.$unwrapHeaders=function(e){var i=this;e.then(function(e){t.$timeout(function(){var t,r;e.length>0&&(t=_.invokeMap(e[0],"toLowerCase"),e.splice(0,1),_.forEach(e,function(e){e=_.zipObject(t,e),r=i.idsMap[e.id],angular.isDefined(r)&&i.$cards[r].init(e)}))})})},t.prototype.$omit=function(){var t={};return angular.forEach(this,function(e,i){"constructor"!=i&&"acls"!=i&&"ids"!=i&&"idsMap"!=i&&"urls"!=i&&"$"!=i[0]&&(t[i]=e)}),t}}(),function(){"use strict";function t(e,i){if("function"!=typeof e.then){if(this.init(e,i),this.pid&&!this.id){var r=t.$$resource.newguid(this.pid);this.$unwrap(r),this.isNew=!0}}else this.$unwrap(e)}t.$TEL_TYPES=["work","home","cell","fax","pager"],t.$EMAIL_TYPES=["work","home","pref"],t.$URL_TYPES=["work","home","pref"],t.$ADDRESS_TYPES=["work","home"],t.$factory=["$timeout","sgSettings","sgCard_STATUS","Resource","Preferences",function(e,i,r,s,n){return angular.extend(t,{STATUS:r,$$resource:new s(i.activeUser("folderURL")+"Contacts",i.activeUser()),$timeout:e,$Preferences:n}),n.defaults.SOGoContactsCategories&&(t.$categories=n.defaults.SOGoContactsCategories),n.defaults.SOGoAlternateAvatar&&(t.$alternateAvatar=n.defaults.SOGoAlternateAvatar),t}];try{angular.module("SOGo.ContactsUI")}catch(t){angular.module("SOGo.ContactsUI",["SOGo.Common","SOGo.PreferencesUI"])}angular.module("SOGo.ContactsUI").constant("sgCard_STATUS",{NOT_LOADED:0,DELAYED_LOADING:1,LOADING:2,LOADED:3,DELAYED_MS:300}).factory("Card",t.$factory),t.$find=function(e,i){var r=this.$$resource.fetch([e,i].join("/"),"view");return i?new t(r):t.$unwrapCollection(r)},t.filterCategories=function(e){var i=new RegExp(e,"i");return _.map(_.filter(t.$categories,function(t){return-1!=t.search(i)}),function(t){return{value:t}})},t.$unwrapCollection=function(e){var i={};return i.$futureCardData=e,e.then(function(e){t.$timeout(function(){angular.forEach(e,function(e,r){i[e.id]=new t(e)})})}),i},t.prototype.init=function(e,i){var r=this;if(angular.isUndefined(this.refs)&&(this.refs=[]),angular.isUndefined(this.categories)&&(this.categories=[]),this.c_screenname=null,angular.extend(this,e),this.$$fullname||(this.$$fullname=this.$fullname()),this.$$email||(this.$$email=this.$preferredEmail(i)),this.$$image||(this.$$image=this.image),this.$$image||(this.$$image=t.$Preferences.avatar(this.$$email,32,{no_404:!0})),this.hasphoto&&(this.photoURL=t.$$resource.path(this.pid,this.id,"photo")),this.isgroup&&(this.c_component="vlist"),this.$avatarIcon=this.$isList()?"group":"person",e.orgs&&e.orgs.length&&(this.orgs=_.map(e.orgs,function(t){return{value:t}})),e.notes&&e.notes.length?this.notes=_.map(e.notes,function(t){return{value:t}}):this.notes&&this.notes.length||(this.notes=[{value:""}]),angular.forEach(["addresses","phones","urls"],function(t){angular.forEach(r[t],function(t){t.type&&(t.type=t.type.toLowerCase())})}),angular.forEach(this.refs,function(e,i){e.email&&(e.emails=[{value:e.email}]),e.id=e.reference,r.refs[i]=new t(e)}),this.birthday){var s=t.$Preferences.$mdDateLocaleProvider;this.birthday=this.birthday.parseDate(s,"%Y-%m-%d"),this.$birthday=s.formatDate(this.birthday)}this.$loaded=angular.isDefined(this.c_name)?t.STATUS.LOADED:t.STATUS.NOT_LOADED,this.empty=" "},t.prototype.$id=function(){return this.$futureCardData.then(function(t){return t.id})},t.prototype.$isLoading=function(){return this.$loaded==t.STATUS.LOADING},t.prototype.$reload=function(){var e;return this.$futureCardData?this:(e=t.$$resource.fetch([this.pid,this.id].join("/"),"view"),this.$unwrap(e))},t.prototype.$save=function(){var e=this,i="saveAsContact";return"vlist"==this.c_component&&(i="saveAsList",_.forEach(this.refs,function(t){t.reference=t.id})),t.$$resource.save([this.pid,this.id||"_new_"].join("/"),this.$omit(),{action:i}).then(function(i){return e.birthday&&(e.$birthday=t.$Preferences.$mdDateLocaleProvider.formatDate(e.birthday)),e.$shadowData=e.$omit(!0),i})},t.prototype.$delete=function(e,i){if(!e)return t.$$resource.remove([this.pid,this.id].join("/"));i>-1&&this[e].length>i?this[e].splice(i,1):delete this[e]},t.prototype.export=function(){var e,i;return e={uids:[this.id]},i={type:"application/octet-stream",filename:this.$$fullname+".ldif"},t.$$resource.download(this.pid,"export",e,i)},t.prototype.$fullname=function(t){var e,i,r=this.c_cn||"",s=t&&t.html;return 0===r.length&&(i=[],this.c_givenname&&this.c_givenname.length>0&&i.push(this.c_givenname),this.nickname&&this.nickname.length>0&&i.push((s?"<em>":"")+this.nickname+(s?"</em>":"")),this.c_sn&&this.c_sn.length>0&&i.push(this.c_sn),i.length>0?r=i.join(" "):this.org&&this.org.length>0?r=this.org:this.emails&&this.emails.length>0&&(e=_.find(this.emails,function(t){return""!==t.value}))&&(r=e.value)),this.contactinfo&&(r+=" ("+this.contactinfo.split("\n").join("; ")+")"),r},t.prototype.$description=function(){var t=[];return this.title&&t.push(this.title),this.role&&t.push(this.role),this.org&&t.push(this.org),this.orgs&&(t=_.concat(t,_.map(this.orgs,"value"))),this.description&&t.push(this.description),t.join(", ")},t.prototype.$preferredEmail=function(t){var e,i;return t&&(i=new RegExp(t,"i"),e=_.find(this.emails,function(t){return i.test(t.value)})),e=e?e.value:(e=_.find(this.emails,function(t){return"pref"==t.type}))?e.value:this.emails&&this.emails.length?this.emails[0].value:this.c_mail&&this.c_mail.length?this.c_mail[0]:""},t.prototype.$shortFormat=function(t){var e=[this.$$fullname],i=this.$preferredEmail(t);return i&&i!=this.$$fullname&&e.push(" <"+i+">"),e.join(" ")},t.prototype.$isCard=function(){return"vcard"==this.c_component},t.prototype.$isList=function(t){var e=!t||!t.expandable||t.expandable&&!this.isgroup;return"vlist"==this.c_component&&e},t.prototype.$addOrg=function(t){return angular.isUndefined(this.orgs)?this.orgs=[t]:t==this.org||_.includes(this.orgs,t)||this.orgs.push(t),this.orgs.length-1},t.prototype.$addEmail=function(t){return angular.isUndefined(this.emails)?this.emails=[{type:t,value:""}]:_.isUndefined(_.find(this.emails,function(t){return""===t.value}))&&this.emails.push({type:t,value:""}),this.emails.length-1},t.prototype.$addScreenName=function(t){this.c_screenname=t},t.prototype.$addPhone=function(t){return angular.isUndefined(this.phones)?this.phones=[{type:t,value:""}]:_.isUndefined(_.find(this.phones,function(t){return""===t.value}))&&this.phones.push({type:t,value:""}),this.phones.length-1},t.prototype.$addUrl=function(t,e){return angular.isUndefined(this.urls)?this.urls=[{type:t,value:e}]:_.isUndefined(_.find(this.urls,function(t){return t.value==e}))&&this.urls.push({type:t,value:e}),this.urls.length-1},t.prototype.$addAddress=function(t,e,i,r,s,n,a,o){return angular.isUndefined(this.addresses)?this.addresses=[{type:t,postoffice:e,street:i,street2:r,locality:s,region:n,country:a,postalcode:o}]:_.find(this.addresses,function(t){return t.street==i&&t.street2==r&&t.locality==s&&t.country==a&&t.postalcode==o})||this.addresses.push({type:t,postoffice:e,street:i,street2:r,locality:s,region:n,country:a,postalcode:o}),this.addresses.length-1},t.prototype.$addMember=function(e){var i,r=new t({email:e,emails:[{value:e}]});if(angular.isUndefined(this.refs))this.refs=[r];else if(0===e.length)this.refs.push(r);else{for(i=0;i<this.refs.length&&this.refs[i].email!=e;i++);i==this.refs.length&&this.refs.push(r)}return this.refs.length-1},t.prototype.explode=function(){var e,i=[];return this.emails?this.emails.length>1?(e=this.$omit(),_.forEach(this.emails,function(r){var s=new t(angular.extend({},e,{emails:[r]}));i.push(s)}),i):[this]:[]},t.prototype.$reset=function(){var t=this;angular.forEach(this,function(e,i){"constructor"!=i&&"$"!=i[0]&&delete t[i]}),this.init(this.$shadowData),this.$shadowData=this.$omit(!0)},t.prototype.$unwrap=function(e){var i=this;return this.$loaded=t.STATUS.DELAYED_LOADING,t.$timeout(function(){i.$loaded!=t.STATUS.LOADED&&(i.$loaded=t.STATUS.LOADING)},t.STATUS.DELAYED_MS),this.$futureCardData=e.then(function(e){return i.init(e),i.$loaded=t.STATUS.LOADED,i.$shadowData=i.$omit(!0),i}),this.$futureCardData},t.prototype.$omit=function(e){var i={};return angular.forEach(this,function(t,r){"refs"==r?i.refs=_.map(t,function(t){return t.$omit(e)}):"constructor"!=r&&"$"!=r[0]&&(i[r]=e?angular.copy(t):t)}),e||(i.birthday?i.birthday=i.birthday.format(t.$Preferences.$mdDateLocaleProvider,"%Y-%m-%d"):i.birthday=""),this.orgs&&(i.orgs=_.map(this.orgs,"value")),this.notes&&(i.notes=_.map(this.notes,"value")),i},t.prototype.toString=function(){var t=this.id+" "+this.$$fullname;return this.$$email&&(t+=" <"+this.$$email+">"),"["+t+"]"}}();
//# sourceMappingURL=Contacts.services.js.map