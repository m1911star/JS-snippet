'use strict';
/*
First:2 types to add element
1: click the add btn in the dirtree-node-header: only show in folder dirtree-node-header, 
1.1: onClickAdd():show input element
1.2:when end input, inform the pController by callbackFunction addNode(event, text)
1.3: pController create new data with the text,then call the options.api.addNode(node,data):change the tree struct
the node: event.target
2: pController call function 
2.1: pController call options.api.addNode2SelectedNode(newData): show input element at the selecedNode(file or folder)
newData: file struct or folder struct
2.2: end input set inputText to addData,then change the tree struct

Second:
in pController will call these functions, and they real definition is in this directivy
options.api ={
  refreshNode : function(node,data){},
  addNode: function(node,data){},
  addNode2SelectedNode : function (newData){},
  deleteSelectedNode: function(){},
  addRootNode: function(newData){},
  refreshSelectedNode : function(data),
  selectNode: function(node){},
  getChildNodeByData : function(rNode, data)
}

treeCallbacks ={
  onToggleNode : function (node,nodeData) {},
  onShowInfo: function (node,nodeData) {},
  onRefreshNode : function (node,nodeData) {},
  onClickNode : function (node,nodeData) {},
  onAddNode : function(node,text){},
  onCheckNode: function (node,nodeData) {},
  onDeleteNode: function(node,nodeData){},
  addNodeEnd : function(node,nodeData, newNode, newNodeData){}  //node: the newNode's parentNode that be changed.
}
*/

var directoryTree = angular.module('directoryTree', []);
directoryTree.directive('dirtree', ['$window', '$document', '_', '$log','$rootScope', 'PopupService', function($window, $document, _, $log, $rootScope, PopupService){
  var scopeOptions = {    
    treeCallbacks: '=', //inform the pControllder
    options: '='
    /*data: '=',          //required    
    api: '=', //pController call these, defined in this directive
    collapesdDefault: '@',    //<boolean> true collapsed else expanded
    collapesdInfoDefault: '@',   //<boolean> true: hide; false: show
    checkDefault: '@',     //<string>: init check status: none || part || all; others will use defaults set
    childrenName: '@',  //<string> the children attr name in data required
    textName:'@',       //<string> the text attr name in data required
    cStatusName:'' ,        //<string> the attr name in data required, which is defined the checkedStatus: part, none, or all
    checkStatus: '',    //<Object> {all: '', part: '', none:''} : the meaning of the value of data[cStatusName]
    
    //<Object> 
    nodeStatus:{
      keyName: '',  //the key in data, which defined the status type
      types:
        {
          statusType1:'statusType1 icon class',   //statusType1: one statusType of the value of data[nodeStatus.keyName]
          statusType2:'statusType2 icon class'
        }
    },
    
    bDirName:'' ,        //<string> the attr name in data required,which is boolean : true: is folderType else filtType
    header: '@',         //<string> if undefined hide the headerDiv;    
    showTypeIcon:'@',       //<boolean> wheather show folder/file type icon.
    showInfo: '@',    //<boolean> wheather can expand infor of the file; true: can expand file to show file info.
    ShowInfoF: true, //<boolean> wheather can expand infor of the folder
    check: '@', //<boolean> wheather can check and show checkBtn
    refresh: '@',   //<boolean> wheather can refresh and show refreshBtn
    add: '@',   //<boolean> wheather can add and show addBtn
    delete: '@',  //<boolean> wheather can delete and show deleteBtn    
    showInput: '@', //<boolean> wheather can input the new node textName
    toggleType: '@',    //<string>  set the toggleIconType: plusMinus || folder || rightBottom ; others will use defaults set
    collapsedIconClass: '@',  //<string> set special class
    expandedIconClass: '@', //<string> set special class
    collapsedInfoIconClass: '@',  //<string> set special class
    expandedInfoIconClass: '@', //<string> set special class
    fileIconClass: '@',     //<string> set special class
    folderIconClass: '@',   //<string> set special class
    refreshIconClass: '@',  //<string> set special class 
    addIconClass: '@',    //<string> set special class 
    deleteIconClass: '@' //<string> set special class 
    */
  };
  
  var directiveDefinitionObject = {   
    priority: 0,   
    template: '<div class="dirtree"><div class="dirtree-header">{{options.header}}</div></div>',
    replace: true,
    restrict: 'AE',    
    scope: scopeOptions,     
    link: function postLink(scope, element, attrs) {
      var baseDiv = angular.element(element)[0];      
      var selectedNode = baseDiv;  
      var lastSelectedNode = null;
      
      var checkStatus = {
        all: 'checked',
        part: 'checkedPart',
        none: 'unChecked'
      };
      var partAsCheck = true;   //true: checkStatus.part set checked=true;
      
      var toggleTypes = {
        folder:{
          collapsedIconClass: 'glyphicon glyphicon-folder-close',
          expandedIconClass: 'glyphicon glyphicon-folder-open', 
        },
        plusMinus:{
          collapsedIconClass: 'glyphicon glyphicon-plus', 
          expandedIconClass: 'glyphicon glyphicon-minus', 
        },
        rightBottom: {
          collapsedIconClass: 'glyphicon glyphicon-triangle-right',
          expandedIconClass: 'glyphicon glyphicon-triangle-bottom', 
        }
      };
      
      var defaults = {
        typeFolder: 'folderNode',   //the folder type name  
        typeFile: 'fileNode',   //the file type name
        collapesdDefault: true,    //init toggle status:true collapsed else expanded
        collapesdInfoDefault: true,   //init showInfoDiv status: true: hide; false: show
        checkDefault: checkStatus.none,     //init check status: none part all               
        childrenName: 'children',
        textName: 'name',
        showTypeIcon: false,
        showInfo: false,  //when this is false, showInfoF = true is invalid. only when this is true, showInfoF is valid.
        showInfoF: false,
        check: false,
        refresh: false,
        add: false,
        delete: false,
        showInput: true,        
        toggleType: 'folder',
        collapsedIconClass: toggleTypes.rightBottom.collapsedIconClass,
        expandedIconClass: toggleTypes.rightBottom.expandedIconClass,
        collapsedInfoIconClass: 'glyphicon glyphicon-triangle-right', //
        expandedInfoIconClass: 'glyphicon glyphicon-triangle-bottom', //
        fileIconClass: 'glyphicon glyphicon-file',
        folderIconClass: 'glyphicon glyphicon-folder-close',
        refreshIconClass: 'glyphicon glyphicon-refresh',
        addIconClass: 'glyphicon glyphicon-plus',
        deleteIconClass: 'glyphicon glyphicon-trash'
      };
      
      var clickBtnTypes = {
        toggle:'toggle',
        check: 'check',
        showInfo: 'showInfo',
        refresh:'refresh',
        addNode:'addNode',        
        deleteNode: 'deleteNode',
        clickRoot:'clickRoot'
      };      
      
      var inputText = null;
      var addData = {};
      var addEvent = null;
      var addType = '';
      var input = $document[0].createElement('input');     
      var specialHtmls = {
        lineSpanHtml: '<span class="line-span"></span>',
        collapsedHtml: '',
        expandedHtml: '',
        collapsedInfoHtml: '', //icon html
        expandedInfoHtml: '', //icon html
        checkHtml: '<input type="checkbox" style="margin-left:5px;" clickType="check"></input>',  //icon html checkDefault
        folderHtml: '',   //icon html
        fileHtml: '',     //icon html
        refreshHtml: '',  //icon html
        addHtml: '',      //icon html
        deleteHtml: '',   //icon html
        infoShowHtml : '<div class="file-info" show="true"></div>',
        infoHideHtml : '<div class="file-info" show="false"></div>', 
        infoHtml: '',
        cFolderSHtml: '',   //collapsedFolderStartHtml
        cFolderEHtml: '',   //collapsedFolderEndHtml
        eFolderSHtml: '',   //expandedFolderStartHtml
        eFolderEHtml: '',   //expandedFolderEndHtml
        cFileSHtml: '',
        cFileEHtml: '',
        eFileSHtml: '',
        eFileEHtml: ''
      };
            
      //this:toggle span
      function onToggle (event) {
        //event.preventDefault();
        //event.stopPropagation();
        var target = event.target;
        var treeNode = target.parentElement.parentElement;
        if( treeNode.data._isCollapsed){           
          treeNode.data._isCollapsed = false;
          target.setAttribute('class', scope.options.expandedIconClass);          
        }else{
          treeNode.data._isCollapsed = true;
          target.setAttribute('class', scope.options.collapsedIconClass);          
        }
        
        treeNode.lastChild.setAttribute('collapsed', treeNode.data._isCollapsed.toString());
        treeNode.firstChild.setAttribute('collapsed', treeNode.data._isCollapsed.toString());
        
        //use element.on() , angular will watch the change
        //but use dome's addListener angular will not watch the change
        ////$rootScope.$apply(); 
        
        //treeNode.data._nodeType === defaults.typeFolder && 
        if(angular.isDefined(scope.treeCallbacks.onToggleNode) && angular.isFunction(scope.treeCallbacks.onToggleNode)){          
          scope.treeCallbacks.onToggleNode(treeNode,treeNode.data);
        }        
      }

      function onShowInfo (event) {
        //event.preventDefault();
        //event.stopPropagation();
        var target = event.target;
        var treeNode = target.parentElement.parentElement;
        if( treeNode.data._isShowInfo){           
          treeNode.data._isShowInfo = false;
          target.setAttribute('class', scope.options.collapsedInfoIconClass);
          target.parentElement.lastChild.setAttribute('show', 'false'); 
                    
        }else{                    
          treeNode.data._isShowInfo = true;
          target.setAttribute('class', scope.options.expandedInfoIconClass);
          target.parentElement.lastChild.setAttribute('show', 'true');          
        }

        ////$rootScope.$apply(); 
        
        if(angular.isDefined(scope.treeCallbacks.onShowInfo) && angular.isFunction(scope.treeCallbacks.onShowInfo)){          
          scope.treeCallbacks.onShowInfo(treeNode, treeNode.data);
        }
        
      }

      //ctNode:childrenTreeNode
      function checkChildNode(ctNode, checked){
        //save staus        
        if(checked){
          ctNode.data._checked = checkStatus.all;          
        }else{
          ctNode.data._checked = checkStatus.none;          
        }
        
        //change view
        ctNode.firstChild.setAttribute('cStatus', ctNode.data._checked);        
        ctNode.firstChild.getElementsByTagName('input')[0].checked = checked;
        
        ctNode.firstChild.getElementsByTagName('input')[0].indeterminate = false;
        
        //children
        angular.forEach(ctNode.lastChild.childNodes, function(node){
          checkChildNode(node, checked);
        });
          
      }
      
      function updateParentNodeCheck(ptNode){
        var oldStatus = ptNode.firstChild.getAttribute('cStatus');
        var childrenNum = ptNode.lastChild.childNodes.length;
        var checkedNum = 0;
        var cStatus = checkStatus.none;
        var bPart = false;         
        
        //the worst is that all children are checked or unChecked.
        //the worse is that the last child has different status with all before.
        for(var i=0; i<childrenNum; i++){
          var childCstatus = ptNode.lastChild.childNodes[i].firstChild.getAttribute('cStatus');
          
          if(childCstatus === checkStatus.part.toString()){
            cStatus = checkStatus.part; 
            bPart = true;
            break;
          }else if(childCstatus === checkStatus.all.toString()){
            checkedNum += 1;
            if(checkedNum < i+1){
              cStatus = checkStatus.part; 
              bPart = true;
            }
          }else if(checkedNum>0){
            cStatus = checkStatus.part; 
            bPart = true;
            break;
          }
        }
        
        if(bPart){
          cStatus = checkStatus.part;
          ptNode.firstChild.getElementsByTagName('input')[0].checked = partAsCheck ? true : false;
        }else if(checkedNum === childrenNum){
          cStatus = checkStatus.all;
          ptNode.firstChild.getElementsByTagName('input')[0].checked = true;
        }else{
          cStatus = checkStatus.none;  
          ptNode.firstChild.getElementsByTagName('input')[0].checked = false;
        }
        
        ptNode.data._checked = cStatus;        
        ptNode.firstChild.getElementsByTagName('input')[0].indeterminate = bPart;
        ptNode.firstChild.setAttribute('cStatus', cStatus);
        
        var lastPnode = ptNode;
        if(oldStatus !== cStatus.toString() && ptNode.parentElement!== baseDiv){
          lastPnode = updateParentNodeCheck(ptNode.parentElement.parentElement);
        }
        
        return lastPnode;
      }
     
      function checkNode(node, checked) {
        checkChildNode(node, checked);
        var ptNode = node.parentElement;
        if(ptNode !== baseDiv){
          //is not the rootNode
          ptNode = ptNode.parentElement; 
          
          return updateParentNodeCheck(ptNode);
        }
        
        return node;
      }
      
      //click check
      function onCheck (event) {        
        var treeNode =  event.target.parentElement.parentElement;
        
        var lastUpdateNode = checkNode(treeNode, event.target.checked);
        
        if(angular.isDefined(scope.treeCallbacks.onCheckNode) && angular.isFunction(scope.treeCallbacks.onCheckNode)){          
          scope.treeCallbacks.onCheckNode(lastUpdateNode, lastUpdateNode.data);
        }
      }      
      
      //this:refresh span
      function onClickRefresh (event) {
        //event.preventDefault();
        var treeNode =  event.target.parentElement.parentElement;
        
        if(angular.isDefined(scope.treeCallbacks.onRefreshNode) && angular.isFunction(scope.treeCallbacks.onRefreshNode)){
          //var args = {event:event,nodeData:this.parentElement.parentElement.data};
          scope.treeCallbacks.onRefreshNode(treeNode, treeNode.data);
        }
      }

      function selectNode(node){
        var selectedNodes = baseDiv.getElementsByClassName('dirtree-node-header selected');
        angular.forEach(selectedNodes,function (node) {
          node.setAttribute('class','dirtree-node-header');
        });
        
        selectedNode = node;
        if(selectedNode !== baseDiv){
          selectedNode.firstChild.setAttribute('class','dirtree-node-header selected');
          if(angular.isDefined(scope.treeCallbacks.onClickNode) && angular.isFunction(scope.treeCallbacks.onClickNode)){
            //var args = {nodeData:this.data};
            scope.treeCallbacks.onClickNode(node, node.data);
          }
        }        
        
      }      

      //when click add btn, show input
      function onClickAdd (event) {
        var treeNode = event.target.parentElement.parentElement;
        if(scope.options.showInput){
          addEvent = event;
          addType = 'addNode';                  
          //var nodeBody = treeNode.lastChild;        
          //nodeBody.insertBefore(input, nodeBody.firstChild);
          event.target.parentElement.parentElement.insertBefore(input, event.target.parentElement.nextElementSibling);
          angular.element(input)[0].focus();
        }else{
          if(angular.isDefined(scope.treeCallbacks.onAddNode) && angular.isFunction(scope.treeCallbacks.onAddNode)){
            scope.treeCallbacks.onAddNode(treeNode, '');
          }
        }
      }
      
      //delete
      function onClickDelete (event) {        
        var delNode = event.target.parentElement.parentElement;
        if(selectedNode === delNode){
          scope.options.api.deleteSelectedNode();
        }else{
          var selNode = selectedNode;
          selectedNode = delNode;
          scope.options.api.deleteSelectedNode();
          selectedNode = selNode;
          selectNode(selNode);
        }       
        
        if(angular.isDefined(scope.treeCallbacks.onDeleteNode) && angular.isFunction(scope.treeCallbacks.onDeleteNode)){
          //var args = {nodeData:this.data};
          scope.treeCallbacks.onDeleteNode(delNode, delNode.data);
        }      
      }
      
      function refreshNodeHeaderContent(div, data) {       
        if(div.childNodes.length > 0 ){          
          deleteChildren(div);
        }        
        
        var innerhtml = '';
        var statusSpan = '</span>';
        //nodeStatus
        if(angular.isDefined(scope.options.nodeStatus) && angular.isDefined(scope.options.nodeStatus.keyName) && angular.isDefined(scope.options.nodeStatus.types)){
          statusSpan += '<span class="'; 
          var type = data[scope.options.nodeStatus.keyName];
          var typeClass = scope.options.nodeStatus.types[type];
          if(angular.isDefined(typeClass)){
            statusSpan += typeClass;
          }
          statusSpan += '"></span>';          
        }
        
        if( data._isCollapsed ){
          if(data._nodeType === defaults.typeFile){
            innerhtml += specialHtmls.cFileSHtml + _.get(data, scope.options.textName) + statusSpan + specialHtmls.cFileEHtml;           
          }else{
            innerhtml += specialHtmls.cFolderSHtml + _.get(data, scope.options.textName) + statusSpan + specialHtmls.cFolderEHtml;          
          }        
        }else{
          if(data._nodeType === defaults.typeFile){
            innerhtml += specialHtmls.eFileSHtml + _.get(data, scope.options.textName) + statusSpan + specialHtmls.eFileEHtml;            
          }else{
            innerhtml += specialHtmls.eFolderSHtml + _.get(data, scope.options.textName) + statusSpan + specialHtmls.eFolderEHtml;            
          }
        }        
        
        div.innerHTML = innerhtml;
        
      }      
      
      /*
      dirtree-node-header: toggleType+type+text+refreshBtn
      dirtree-node-body:
      */
      function createNode(rNode, data) {        
        if(angular.isDefined(scope.options.bDirName) && _.has(data,scope.options.bDirName)){
          //didnot has childList then define by bDirName
          if(_.get(data,scope.options.bDirName)){
            data._nodeType = defaults.typeFolder;
            if(angular.isUndefined(data[scope.options.childrenName])){
              data[scope.options.childrenName] = [];
            }
          }else{
            data._nodeType = defaults.typeFile;
          }
          
        }else if(angular.isDefined(data[scope.options.childrenName])){
          //define nodeType by childrenName
          data._nodeType = defaults.typeFolder;          
        }else{
          data._nodeType = defaults.typeFile;
        }
        
        rNode.data = data;        
        
        //tree node header data
        var div = $document[0].createElement('div');
        div.setAttribute('class','dirtree-node-header');              
        refreshNodeHeaderContent(div, data);
        ////refreshNodeHeaderContentByCreate(div, data);
        rNode.appendChild(div);

        //children
        div = $document[0].createElement('div');
        div.setAttribute('class','dirtree-node-body');        
        
        if(data[scope.options.childrenName] && angular.isArray(data[scope.options.childrenName])){        
          for(var i=0; i<data[scope.options.childrenName].length; i++){
            var child = $document[0].createElement('div');     
            child.setAttribute('class','dirtree-node');

            inheritParentSettings(data, data[scope.options.childrenName][i]);          
            createNode(child, data[scope.options.childrenName][i]);
            div.appendChild(child);
          }
        }
        
        rNode.appendChild(div);
        rNode.firstChild.setAttribute('collapsed', data._isCollapsed.toString());
        
        var cStatus = data._checked;
        rNode.firstChild.setAttribute('cStatus', cStatus);
        if(scope.options.check){
          if(cStatus === checkStatus.part){
            rNode.firstChild.getElementsByTagName('input')[0].indeterminate = true;
            rNode.firstChild.getElementsByTagName('input')[0].checked = partAsCheck?true:false;
          }else{
            rNode.firstChild.getElementsByTagName('input')[0].indeterminate = false;
            rNode.firstChild.getElementsByTagName('input')[0].checked = false;
            if(cStatus === checkStatus.all){
              rNode.firstChild.getElementsByTagName('input')[0].checked = true;
            }
          }
        }
                
        rNode.lastChild.setAttribute('collapsed', data._isCollapsed.toString());   
        
      }

      function deleteChildren(rNode) {
        while(rNode.childNodes.length>0){
          rNode.removeChild(rNode.childNodes[0]);
        }
      }

      function onRefreshNode (rNode, data) {
        //update the rNode.data
        _.map(_.keys(data),function(key/*, i*/){
          //console.info('key-i: '+key+'-'+i);
          rNode.data[key] = data[key];
        });
        
        deleteChildren(rNode);

        //if rNode === selectedNode after create, the selected status disp
        rNode.data._isShowInfo = !scope.options.collapesdInfoDefault;
        createNode(rNode, rNode.data);
        
        //so reSelectThis
        if(rNode === selectedNode){
          selectNode(rNode);
        }
      }  
      
      function initRootSettings(data) {
        if(angular.isUndefined(data._deep)){
          data._deep = 0;  
          data._treePath = '/';
        }

        if(angular.isUndefined(data._isCollapsed)){
          data._isCollapsed = scope.options.collapesdDefault;
        }

        if(angular.isUndefined(data._isShowInfo)){
          data._isShowInfo = !scope.options.collapesdInfoDefault;
        }       
        
        if(angular.isUndefined(data._checked)){
          if(angular.isDefined(scope.options.cStatusName) && angular.isDefined(data[scope.options.cStatusName])){
            var cStatus = data[scope.options.cStatusName];
            data._checked = cStatus;            
          }else{
            data._checked = scope.options.checkDefault;
          }
        }  
                
      }
      
      function inheritParentSettings (pData, data) {
        data._deep = pData._deep + 1;
        data._treePath = pData._treePath + _.get(pData, scope.options.textName) + '/';
        
        if(angular.isUndefined(data._isCollapsed)){
          ////data._isCollapsed = pData._isCollapsed; 
          data._isCollapsed = scope.options.collapesdDefault;
        }
        
        /*if(angular.isUndefined(data._isShowInfo)){
          data._isShowInfo = pData._isShowInfo;  
        }*/
        data._isShowInfo = !scope.options.collapesdInfoDefault;
        
        if(angular.isUndefined(data._checked)){
          
          if(pData._checked === checkStatus.all){
            //the parentNode checked.all has 1 priority!
            data._checked = pData._checked;
          }else if(angular.isDefined(scope.options.cStatusName) && angular.isDefined(data[scope.options.cStatusName])){
            // 2 priority set by itself status
            var cStatus = data[scope.options.cStatusName];
            data._checked = cStatus;            
          }else{
            // else inherit its parent
            data._checked = pData._checked; 
          }          
        }
      }
      
      //add data to dirtree-node
      function addChildNode(rNode, data) {
        //add new data to children array
        var pData = rNode.data;        
        inheritParentSettings(pData, data);
        if(rNode.data[scope.options.childrenName] && angular.isArray(rNode.data[scope.options.childrenName])){
          rNode.data[scope.options.childrenName].unshift(data);
        }else{
          rNode.data[scope.options.childrenName] = [data];
          //refresh nodetype          
          rNode.data._nodeType = defaults.typeFolder;
          refreshNodeHeaderContent(rNode.firstChild, rNode.data);
        }
        
        //add new child node        
        var child = $document[0].createElement('div');     
        child.setAttribute('class','dirtree-node');
        
        //create child node 
        createNode(child, data);
        
        var childrenNode = rNode.lastChild;        
        if(childrenNode.childNodes.length>0){
          var fChild = childrenNode.childNodes[0];
          childrenNode.insertBefore(child, fChild);
        }else{
          childrenNode.appendChild(child);
        }
        
        return child;
      }      
      
      function addNode2Selected(addData){
        var newNode = null;
        
        if(selectedNode === baseDiv){
          if(scope.options.data === null){
            scope.options.data = addData;
            createTree();
          }else{
            scope.options.data.push(addData);
            createRootNode(addData);
            selectNode(baseDiv.childNodes[baseDiv.childNodes.length-1]);
          }

          newNode = baseDiv.childNodes[baseDiv.childNodes.length-1];
          if(angular.isDefined(scope.treeCallbacks.addNodeEnd) && angular.isFunction(scope.treeCallbacks.addNodeEnd)){
            scope.treeCallbacks.addNodeEnd(baseDiv,scope.options.data, newNode, newNode.data);   
          }
        }else{
          if(angular.isUndefined(selectedNode.data[scope.options.childrenName])){
            selectedNode.data[scope.options.childrenName] = [];
            selectedNode.data[scope.options.childrenName].unshift(addData);
            //will update the pNode status
            onRefreshNode(selectedNode,selectedNode.data);
            newNode = selectedNode.lastChild.firstChild;
          }else{      
            //only change the new node, not update the pNode info
            newNode = addChildNode(selectedNode, addData);
          }

          if(angular.isDefined(scope.treeCallbacks.addNodeEnd) && angular.isFunction(scope.treeCallbacks.addNodeEnd)){
            scope.treeCallbacks.addNodeEnd(selectedNode, selectedNode.data, newNode, newNode.data);   //{data:selectedNode.data}
          }
        }
      }
      
      //input.addEventListener      
      angular.element(input).on('blur', function(event){        
        event.preventDefault();
        event.stopPropagation();
        
        inputText = input.value.trim();        
       
        if(addType === 'add2SelNode'){
          selectedNode.removeChild(input);

          if(inputText !== ''){
            _.set(addData, scope.options.textName, inputText);
            addNode2Selected(addData);
          }else{
            if(lastSelectedNode!==null){
              selectNode(lastSelectedNode);
              lastSelectedNode = null;
            }
          }
        }else{
          addEvent.target.parentElement.parentElement.removeChild(input);

          //var args = {event:addEvent,text:inputText};
          // send the text to pController
          if(inputText !== '' && angular.isDefined(scope.treeCallbacks.onAddNode) && angular.isFunction(scope.treeCallbacks.onAddNode)){
            scope.treeCallbacks.onAddNode(addEvent.target.parentElement.parentElement, inputText);
          }
        }

        input.value = '';
            
      });
      
      function createRootNode(data){
        var rootNode = $document[0].createElement('div');
        rootNode.setAttribute('class', 'dirtree-node'); 
        rootNode.setAttribute('root', 'true');
        initRootSettings(data);
        createNode(rootNode, data);  
        baseDiv.appendChild(rootNode);         
      }
      
      function createTree(){
        var i = 0;
        var rootNode = null;

        for(i = baseDiv.childNodes.length-1; i>0; i--){
          rootNode = baseDiv.childNodes[i];
          ////deleteChildren(rootNode); //when delete rootNode also remove its children, so this is redundance!
          baseDiv.removeChild(rootNode);
        }
        
        if(angular.isArray(scope.options.data)){
          for(i=0; i<scope.options.data.length; i++){
            createRootNode(scope.options.data[i]);
          }
        }else{          
          createRootNode(scope.options.data);            
        }
        
        if(baseDiv.childNodes.length>1){
          selectNode(baseDiv.childNodes[1]);        
        }
      }
      
      function initTreeApi(){
        //tree->dirtree-node-header->refrshBtn      
        scope.options.api.refreshNode = function(node,data){          
          onRefreshNode(node, data);
        };

        //add file to folder, change the tree struct
        scope.options.api.addNode = function(node,data){         
          var newNode = addChildNode(node, data);
          if(angular.isDefined(scope.treeCallbacks.addNodeEnd) && angular.isFunction(scope.treeCallbacks.addNodeEnd)){
            scope.treeCallbacks.addNodeEnd(node, node.data, newNode, newNode.data); 
          }
        };

        //add file or folder to selectedNode(file or folder) show the input
        scope.options.api.addNode2SelectedNode = function (newData) { 
          if(!scope.options.showInput || (angular.isDefined(newData) && _.has(newData, scope.options.textName)) ){
            addNode2Selected(newData);            
          }else{            
            addType = 'add2SelNode';
            addData = newData; 
            if(angular.isUndefined(newData) || newData===null){
              addData = {};
              addData[scope.options.childrenName] = [];
            }
            
            if(selectedNode === baseDiv){            
              baseDiv.appendChild(input);
            }else{                    
              selectedNode.insertBefore(input, selectedNode.lastChild);
            }
            angular.element(input)[0].focus();
          }
        };

        //delete selectednode
        scope.options.api.deleteSelectedNode = function(){
          if(selectedNode === baseDiv){
            return;
          }

          //delete children
          ////deleteChildren(selectedNode); //when delete rootNode also remove its children,so this is redundance

          var selData = selectedNode.data;
          var parent = selectedNode.parentElement;  //baseDiv or dirtree-node-body
          var next = selectedNode.nextElementSibling;
          var pClass = parent.getAttribute('class');
          var pData = [];
          //console.info(pClass);

          //remove it from its parent
          parent.removeChild(selectedNode);        

          //change its parent talbe node.data
          if(pClass === 'dirtree-node-body'){
            parent = parent.parentElement;  //tableNode

            pData = parent.data[scope.options.childrenName];  
            var index = _.indexOf(pData, selData);
            pData.splice(index,1);

            parent.firstChild.setAttribute('class','dirtree-node-header selected');

            //reset selectedNode
            selectNode(parent);
          }else{
            if( angular.isArray(scope.options.data)){
              scope.options.data.splice(_.indexOf(scope.options.data, selData),1);              
            }else{
              scope.options.data = null;              
            }

            //reset selectedNode
            selectNode(parent); 

            if(next !== null){
              selectNode(next);            
            }else if(baseDiv.childNodes.length>1){
              //delete the last rootNode, then selected the last
              selectNode(baseDiv.childNodes[baseDiv.childNodes.length - 1]);            
            }
          }        

        };
        
        scope.options.api.addRootNode = function(newData){
          lastSelectedNode = selectedNode;
          if(selectedNode !== baseDiv){
            selectedNode = baseDiv;          
          }

          scope.options.api.addNode2SelectedNode(newData);

        };
        
        scope.options.api.refreshSelectedNode = function(data){
          onRefreshNode(selectedNode,data);
          return selectedNode;
        };
        
        scope.options.api.selectNode = function(node){
          selectNode(node);
        };
        
        scope.options.api.getChildNodeByData = function(rNode, data){
          for(var i=0; i<rNode.lastChild.childNodes.length; i++ ){
            var child = rNode.lastChild.childNodes[i];
            if(child.data === data){
              return child;
            }
          }
        };
      }
      
      function setDefaults () {  
        //treeCallbacks
        if (angular.isUndefined(attrs.treeCallbacks)) {
          $log.warn('you would better define the treeCallbacks!'); 
          scope.treeCallbacks = {};
        }      
      
        //initApi
        scope.options.api = {};
        initTreeApi();
        
        //collapesdDefault
        if(angular.isUndefined(scope.options.collapesdDefault)){
          scope.options.collapesdDefault = defaults.collapesdDefault;
        }
        
        //collapesdInfoDefault
        /*if(angular.isUndefined(scope.options.collapesdInfoDefault)){
          scope.options.collapesdInfoDefault = defaults.collapesdInfoDefault;
        }*/
        //disabled set!
        scope.options.collapesdInfoDefault = defaults.collapesdInfoDefault;
        if(scope.options.collapesdInfoDefault){
          specialHtmls.infoHtml = specialHtmls.infoHideHtml;
        }else{
          specialHtmls.infoHtml = specialHtmls.infoShowHtml;
        }
        
        //checkDefault: 
        if(angular.isUndefined(scope.options.checkDefault)){
          scope.options.checkDefault = defaults.checkDefault;
        }        
        
        //showInput
        if (angular.isUndefined(scope.options.showInput)) {
          scope.options.showInput = defaults.showInput;
        }
        
        //title
        if (angular.isUndefined(scope.options.header)) {          
          baseDiv.firstChild.setAttribute('style','display:none;');
        }     
        
        //required children-name
        if (angular.isUndefined(scope.options.childrenName)) {
          scope.options.childrenName = defaults.childrenName;
        }  
      
        //required text-name
        if (angular.isUndefined(scope.options.textName)) {
          scope.options.textName = defaults.textName;
        }           
      
        //toggle
        if (angular.isUndefined(scope.options.toggleType)) {
          scope.options.toggleType = defaults.toggleType;
        }
        
        if(angular.isUndefined(scope.options.collapsedIconClass)){
          if(scope.options.toggleType === 'plusMinus'){
            scope.options.collapsedIconClass = toggleTypes.plusMinus.collapsedIconClass;            
          }else if(scope.options.toggleType === 'folder'){
            scope.options.collapsedIconClass = toggleTypes.folder.collapsedIconClass;            
          }else{
            scope.options.collapsedIconClass = defaults.collapsedIconClass;            
          }
        }
        
        if(angular.isUndefined(scope.options.expandedIconClass)){
          if(scope.options.toggleType === 'plusMinus'){            
            scope.options.expandedIconClass = toggleTypes.plusMinus.expandedIconClass;
          }else if(scope.options.toggleType === 'folder'){            
            scope.options.expandedIconClass = toggleTypes.folder.expandedIconClass;
          }else{            
            scope.options.expandedIconClass = defaults.expandedIconClass;
          }
        }
        
        specialHtmls.collapsedHtml = '<span class="'+scope.options.collapsedIconClass+'" clickType="'+clickBtnTypes.toggle+'"></span>'; 
        specialHtmls.expandedHtml = '<span class="'+scope.options.expandedIconClass+'" clickType="'+clickBtnTypes.toggle+'"></span>';
        
        //toggleInfo
        if (angular.isUndefined(scope.options.collapsedInfoIconClass)) {
          scope.options.collapsedInfoIconClass = defaults.collapsedInfoIconClass;  
        }
        
        specialHtmls.collapsedInfoHtml = '<span class="'+scope.options.collapsedInfoIconClass+'" clickType="'+clickBtnTypes.showInfo+'"></span>';
        
        if (angular.isUndefined(scope.options.expandedInfoIconClass)) {
          scope.options.expandedInfoIconClass = defaults.expandedInfoIconClass; 
        }
        specialHtmls.expandedInfoHtml = '<span class="'+scope.options.expandedInfoIconClass+'" clickType="'+clickBtnTypes.showInfo+'"></span>';
        
        if (angular.isUndefined(scope.options.showInfo)) {
          scope.options.showInfo = defaults.showInfo;
        }
        
        if (angular.isUndefined(scope.options.showInfoF)) {
          scope.options.showInfoF = defaults.showInfoF;
        }
        
        if(!scope.options.showInfo){
          specialHtmls.expandedInfoHtml = '';
          specialHtmls.collapsedInfoHtml = ''; 
          specialHtmls.infoHtml = '';                   
        }        
        
        //check
        if (angular.isUndefined(scope.options.check)) {
          scope.options.check = defaults.check;
        }
        
        if(!scope.options.check){
          specialHtmls.checkHtml = '';          
        }
        
        if (angular.isDefined(scope.options.checkStatus)) {
          checkStatus = scope.options.checkStatus;
        }
        
        //showTypeIcon
        if (angular.isUndefined(scope.options.folderIconClass)) {
          scope.options.folderIconClass = defaults.folderIconClass;
        }        
        specialHtmls.folderHtml = '<span class="'+scope.options.folderIconClass+'" ></span>';
            
        if (angular.isUndefined(scope.options.fileIconClass)) {
          scope.options.fileIconClass = defaults.fileIconClass;
        }
        specialHtmls.fileHtml = '<span class="'+scope.options.fileIconClass+'" ></span>';      
      
        if(scope.options.folderIconClass === ''){
          specialHtmls.fileHtml = '<span class="'+scope.options.fileIconClass+'" style="margin-left:-14px;"></span>';
        }
        
        //false set folderIconClass and fileIconClass : ''      
        if (angular.isUndefined(scope.options.showTypeIcon)) {
          scope.options.showTypeIcon = defaults.showTypeIcon;
        }       
                        
        if(!scope.options.showTypeIcon){
          scope.options.folderIconClass = '';
          scope.options.fileIconClass = '';
          specialHtmls.folderHtml = '';
          specialHtmls.fileHtml = '';
        }           
        
        //refresh
        if (angular.isUndefined(scope.options.refreshIconClass)) {
          scope.options.refreshIconClass = defaults.refreshIconClass;
        }        
        specialHtmls.refreshHtml = '<span class="'+scope.options.refreshIconClass+'" clickType="'+clickBtnTypes.refresh +'"></span>';
        
        if (angular.isUndefined(scope.options.refresh)) {
          scope.options.refresh = defaults.refresh;
        } 
              
        if(!scope.options.refresh){
          scope.options.refreshIconClass = ''; 
          specialHtmls.refreshHtml = '';
        }
        
        //add
        if (angular.isUndefined(scope.options.addIconClass)) {
          scope.options.addIconClass = defaults.addIconClass;
        }  
        specialHtmls.addHtml = '<span class="'+scope.options.addIconClass+'" clickType="'+clickBtnTypes.addNode+'"></span>';
        
        if (angular.isUndefined(scope.options.add)) {
          scope.options.add = defaults.add;
        }
        
        if(!scope.options.add){
          scope.options.addIconClass = '';
          specialHtmls.addHtml = '';
        }
        
        //delete
        if (angular.isUndefined(scope.options.deleteIconClass)) {
          scope.options.deleteIconClass = defaults.deleteIconClass;
        } 
        specialHtmls.deleteHtml = '<span class="'+scope.options.deleteIconClass+'" clickType="'+clickBtnTypes.deleteNode+'"></span>';
        
        if (angular.isUndefined(scope.options.delete)) {
          scope.options.delete = defaults.delete;
        }
        
        if(!scope.options.delete){
          scope.options.deleteIconClass = '';
          specialHtmls.deleteHtml = '';
        }        
        
        initSpecialHtmls();
      }      
      
      function initSpecialHtmls () {
        //collapsed folder header start
        specialHtmls.cFolderSHtml = specialHtmls.lineSpanHtml + specialHtmls.collapsedHtml;
        if(scope.options.showInfoF){
          specialHtmls.cFolderSHtml += specialHtmls.collapsedInfoHtml;
        }        
        specialHtmls.cFolderSHtml += specialHtmls.checkHtml;
        specialHtmls.cFolderSHtml += specialHtmls.folderHtml+'<span class="text-span">';
        
        //collapsed folder header end
        specialHtmls.cFolderEHtml = specialHtmls.refreshHtml;
        specialHtmls.cFolderEHtml += specialHtmls.addHtml;
        specialHtmls.cFolderEHtml += specialHtmls.deleteHtml;
        specialHtmls.cFolderEHtml += specialHtmls.infoHideHtml;

        //expanded folder header start
        specialHtmls.eFolderSHtml = specialHtmls.lineSpanHtml + specialHtmls.expandedHtml;
        if(scope.options.showInfoF){
          specialHtmls.eFolderSHtml += specialHtmls.collapsedInfoHtml;
        }
        specialHtmls.eFolderSHtml += specialHtmls.checkHtml;
        specialHtmls.eFolderSHtml += specialHtmls.folderHtml+'<span class="text-span">';
        
        //expanded folder header end
        specialHtmls.eFolderEHtml = specialHtmls.refreshHtml;
        specialHtmls.eFolderEHtml += specialHtmls.addHtml;
        specialHtmls.eFolderEHtml += specialHtmls.deleteHtml;
        specialHtmls.eFolderEHtml += specialHtmls.infoHtml;
        
        //collapsed file header start
        specialHtmls.cFileSHtml = specialHtmls.lineSpanHtml; 
        if((scope.options.showInfo && scope.options.showInfoF) || !scope.options.showInfo){
          // on the same layer file is less one icon than folder. so add an span.
          specialHtmls.cFileSHtml += '<span style="width:19px;"></span>';
        }
        specialHtmls.cFileSHtml += specialHtmls.collapsedInfoHtml;
        specialHtmls.cFileSHtml += specialHtmls.checkHtml;
        specialHtmls.cFileSHtml += specialHtmls.fileHtml+'<span class="text-span">';
        
        //collapsed file header end
        specialHtmls.cFileEHtml = specialHtmls.refreshHtml;
        //specialHtmls.cFileEHtml += specialHtmls.addHtml;
        specialHtmls.cFileEHtml += specialHtmls.deleteHtml;
        specialHtmls.cFileEHtml += specialHtmls.infoHideHtml;

        //expanded file header start        
        specialHtmls.eFileSHtml = specialHtmls.lineSpanHtml;
        if((scope.options.showInfo && scope.options.showInfoF) || !scope.options.showInfo){
          specialHtmls.eFileSHtml += '<span style="width:19px;"></span>';
        }
        specialHtmls.eFileSHtml += specialHtmls.collapsedInfoHtml;
        specialHtmls.eFileSHtml += specialHtmls.checkHtml;
        specialHtmls.eFileSHtml += specialHtmls.fileHtml+'<span class="text-span">';
        
        //expanded file header end
        specialHtmls.eFileEHtml = specialHtmls.refreshHtml;
        //specialHtmls.eFileEHtml += specialHtmls.addHtml;
        specialHtmls.eFileEHtml += specialHtmls.deleteHtml;
        specialHtmls.eFileEHtml += specialHtmls.infoHtml;
      }
      
      //
      element.on('click',function(event){
        var target = event.target;
        var clickType = target.getAttribute('clickType');
        var pClass = target.parentElement.getAttribute('class');
        //console.info('clickType:'+ clickType);  
        //console.info('pClass:'+pClass);
        if(clickType === clickBtnTypes.toggle){
          onToggle(event);
        }else if(clickType === clickBtnTypes.showInfo){
          onShowInfo(event);
        }else if(clickType === clickBtnTypes.check){
          onCheck(event);
        }else if(clickType === clickBtnTypes.refresh){
          onClickRefresh(event);
        }else if(clickType === clickBtnTypes.addNode){
          onClickAdd(event);
        }else if(clickType === clickBtnTypes.deleteNode){
          var msg = '是否要删除：     ' + event.target.parentElement.parentElement.data[scope.options.textName];
          var promise = PopupService.confirm({msg: msg});
          promise.then(function(confirmed) {
            if (confirmed) {
              onClickDelete(event);
            }
          }, function() {
            $log.debug('you cancel delete node!');
          });        
          
        }else if(pClass === 'dirtree-node-header'){
          selectNode(event.target.parentElement.parentElement); 
        }else if(pClass === 'dirtree-node'){
          selectNode(event.target.parentElement); 
        }
      });
          
      scope.$watch('options.data', function(newVal){        
        if(angular.isDefined(newVal)){ 
           
          //var startT = (new Date()).getTime();          
          //console.info('createTree start: '+startT);
          setDefaults();               
          createTree();
          //var endT = (new Date()).getTime();
          //console.info('createTree end: '+endT);
          //console.info('used: '+(endT-startT));
        }else{
          $log.error('should set options.data!');          
        }
      }); 
    }
  };
  return directiveDefinitionObject;
}]);