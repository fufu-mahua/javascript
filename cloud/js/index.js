(function (){
	
	// let files;
	let nowId = -1;

	/* 通过ID找到数据 */
	function getNowId(id){
		for(let i =0; i < data.length; i++){
			if(data[i].id == id){
				return data[i];
			}
		}
		return null;
	}
	/* 通过ID,找到它的子级 */
	function getChildsId(id){
		let childArr = [];
		for(let i = 0; i < data.length; i++){
			if(data[i].pid == id){
				childArr.push(data[i]);
			}
		}
		return childArr;
	}

	/* 获取所有的子级 */
	function getAllChilds(id){
		let childId = getChildsId(id);
		childId.forEach((item)=>{
			let itemChild = getChildsId(item.id);
			if(itemChild.length > 0){
				childId = childId.concat(getAllChilds(item.id));
			}
		});
		return childId;
	}
	/* 获取所有的子级 */

	/* 通过ID，找到它的父级 */
	function getParentId(id){
		let nowId = getNowId(id);
		return getNowId(nowId.pid);
	}

	/* 通过ID，找到所有的父级 */
	function getParentAllId(data,id){
		let parId = getParentId(id);
		let arr = [];
		while(parId){
			arr.unshift(parId);
			parId = getParentId(parId.id);
		}
		return arr;
	}

	/* 删除所有子级 */
	function delData(id){
		let self = getNowId(id);
		let chils = getAllChilds(id);
		chils.push(self);
		data = data.filter(item=>!chils.includes(item));
	}
	/* 删除所有子级 */
	

	
	/* 判断当前ID下还有没有子级 */
	function hasChilds(data,id){
		return getChildsId(id).length !== 0;
	}

	let wrap = document.querySelector('#wrap');
	let content = wrap.querySelector('.content');
	let menuTree = content.querySelector('.menu');
	let rightMenu  = document.querySelector('.folder_area .move_to .menu_list');
	let level = 0;
	/* 左边菜单栏的生成 */
	function creatElement(data,treeId,level){
		let inner = `<ul class="list clear">`;
		let childs = getChildsId(treeId);
		//let arrowIcon = hasChilds(data,item.id)?'iconfont icon-yousanjiao':'';
		// level++;
		childs.forEach((item,index)=>{
			let arrowIcon = hasChilds(data,item.id)?'iconfont icon-yousanjiao':'';
			inner += `
			<li>
                <div data-id="${item.id}" class="tree-title" style="padding-left:${10+level*20}px">
                	<p data-id="${item.id}" class="iconfont icon-Group- folder_icon arrow"> <i data-id="${item.id}" class="${getChildsId(item.id).length !=0?'iconfont icon-yousanjiao':''}"></i> ${item.title}</p>
                </div>
                 ${hasChilds(data,item.id)?creatElement(data,item.id,level+1):""}
            </li>
			`;
		});
		inner += `</ul>`;
		return inner;
	}
	menuTree.innerHTML = creatElement(data,-1,level);
	rightMenu.innerHTML = creatElement(data,-1,level);
	/* 左边菜单栏的生成 */
	

	/* 导航栏的生成 */
	let navEl = document.querySelector('.nav');//导航栏
	let navList = document.querySelector('.nav_list');
	function nav(id){
		let dat = getParentAllId(data,id);
		let nowId = getNowId(id);
		let inner = '';
		dat.forEach((item)=>{
			inner+=`
				<div data-id="${item.id}" class="tit">
                    <span>${item.title}</span>
                    <i class="iconfont icon-youjiantou1"></i>
                </div>
			`;
		});
		inner+=`
			<div class="tit active">
                <span>${nowId.title}</span>
            </div>
		`;
		return inner;
	}
	navList.innerHTML = nav(0);
	/* 导航栏的生成 */


	let folderArea = document.querySelector('.folder_area');
	let folderList = document.querySelector('.folder_list ul');
	let contentxMenu = document.querySelector('.folder_area .contentx_menu');//右键菜单块
	let contMenItem = document.querySelectorAll('.folder_area .contentx_menu .item');
	//右键菜单的每一项
	let folder = document.querySelector('.folder_area .folder');//文件夹区域(滚动的区域)
	let moveTo = document.querySelector('.folder_area .move_to');//移动到的弹窗
	let rigTreeList = document.querySelector('.folder_area .menu_list');
	let targetId = -1;//当前右键点击的ID
	let sureMove = document.querySelector('.folder_area .move_to .sure')//确定
	let cancel = document.querySelector('.folder_area .move_to .cancel')//取消
	let moveClose =  document.querySelector('.folder_area .move_to .close_icon')//移动到关闭按钮
	let myId,parentId;
	let checks = [];
	/* 移动到 */
	rigTreeList.addEventListener('click',function (e){
		 myId = Number(e.target.dataset.id);//要移到到的ID
		 let lis = document.querySelectorAll('.folder_list ul .folder_active');
		 parentId = getParentId(myId);//父级
		 if(lis.length == 0){
			checks.push(getNowId(targetId));
		 }else{
			lis.forEach((item)=>{
				checks.push(getNowId(item.dataset.id));
			});
		}
	});
	sureMove.onclick = function (){
		if(myId != parentId.id){
			for(let i =0; i < checks.length;i++){
				let allChils = getAllChilds(checks[i].id);
				if(myId == checks[i].id){
					alertSelect("不能移动到自己");
					return ;
				}
				if(renameText(checks[i].id,checks[i].title,myId)){
					alertSelect("目标文件夹下名字有冲突");
					return ;
				}
				for(let j = 0; j < allChils.length; j++){
					if(myId == allChils[j].id){
						alertSelect("不能移动到子级");
						return ;
					}
				}
				checks[i].pid = myId;
			}
		}
		menuTree.innerHTML = creatElement(data,-1,level);
		folderList.innerHTML = creatFolderList(myId);
		navList.innerHTML = nav(myId);
		moveTo.style.display = 'none';
		nowId = myId;
	}
	cancel.onclick = moveClose.onclick = function (){
		moveTo.style.display = 'none';
	}

	/* 移动到点击消失  */
	contMenItem[1].addEventListener('click',function (e){
			noneEl(contentxMenu,moveTo);
	})
	/* 移动到点击消失  */


	/* 删除文件成功 */
	let delSuc = document.querySelector('.del_success'); 
	function alertDel(inner){
		delSuc.style.display = 'block'
		delSuc.children[1].innerHTML = inner;
		setTimeout(function (){
			sucAlert.style.display = 'none'
		},1500);
	}
	/* 删除文件成功 */


	/* 请选择要删除的文件 */
	let selectAlert = document.querySelector('.select_file'); 
	function alertSelect(inner){
		selectAlert.style.display = 'block'
		selectAlert.children[1].innerHTML = inner;
		setTimeout(function (){
			selectAlert.style.display = 'none'
		},1500);
	}
	/* 请选择要删除的文件 */

	

	/* 拖拽 */
	let drag = document.querySelector('.folder_area .drag');
	document.addEventListener('selectstart',function (e){
		e.preventDefault();
	})
	folderArea.addEventListener('mousedown',function (e){
		let lis = document.querySelectorAll('.folder_list ul li');
		let tar = e.target;
		if(e.button != 0 || lis.length == 0){
			return ;
		}else if(tar.tagName == "SPAN"
		|| tar.tagName == "LABEL"
		|| tar.tagName == "LI"
		|| tar.tagName == "INPUT"){
			return ;
		}
		if(tar.tagName == "IMG"){
			e.preventDefault();
			return ;
		}
		let dX = e.clientX;
		let dY = e.clientY;
		// drag = document.createElement('div');
		// drag.classList.add('drag');
		// folderArea.appendChild(drag);
		drag.style.opacity = '1';
		drag.style.zIndex = '2';
		drag.style.width = '0';
		drag.style.height = '0';
		document.addEventListener('mousemove',move);
		function move(e){
			let mX = e.clientX;
			let mY = e.clientY;
			let x = Math.abs(mX - dX);
			let y = Math.abs(mY - dY);
			let l = folderArea.getBoundingClientRect().left;
			let t = folderArea.getBoundingClientRect().top;
			let isCheck = document.querySelectorAll('.folder_list .folder_active');
			if(isCheck.length == lis.length){
				selectAll.classList.add('all_aitive');
			}else{
				selectAll.classList.remove('all_aitive');
			}
			if(mX < l){
				mX = l;
				// drag.style.width = l - x + "px";
			}else{
				drag.style.width = x + "px";
			}
			if(mY < t){
				mY = t;
				// drag.style.height = t - y + "px";
			}else{
				drag.style.height = y + "px";
			}
			drag.style.left = Math.min(mX,dX) + "px";
			drag.style.top = Math.min(mY,dY) + "px";
			lis.forEach((item)=>{
				if(isBoon(item,drag)){
					item.classList.add('folder_active');
				}else{
					item.classList.remove('folder_active');
				}
			});
		}
		document.addEventListener('mouseup',function (){
			drag.style.opacity = '0';
			drag.style.zIndex = '-1';
			document.removeEventListener('mousemove',move);
		},{once:true});
	});
	function isBoon(el,el2){
		let rect1 = el.getBoundingClientRect();
		let rect2 = el2.getBoundingClientRect();
		if(rect1.left > rect2.right
		|| rect2.left > rect1.right
		|| rect1.top > rect2.bottom
		|| rect2.top > rect1.bottom){
			return false; //没有碰撞上
		}
		return true;//碰上了
	}
	/* 拖拽 */

	/* 删除点击消失  */
	let delAlert = document.querySelector('.folder_area .del_alert');//删除弹窗
	let delSure = delAlert.querySelector('.folder_area .del_alert .sure');//确定删除
	let canelDel = delAlert.querySelector('.folder_area .del_alert .cancel');//取消
	let delClo = delAlert.querySelector('.folder_area .del_alert .close_icon');
	let allId = [];
	contMenItem[0].addEventListener('click',function (e){
		delAlert.style.display = 'block';
	})
	
	delSure.addEventListener('click',function (e){
		delFn(e);
	});
	
	
	function delFn(e){
		delAlert.style.display = 'none';
		/* 多选删除 */
		let lis = document.querySelectorAll('.folder_list ul .folder_active');
		if(lis.length == 0){
			delData(targetId);//单选删除
		}else{
			lis.forEach((item)=>{
				delData(item.dataset.id);//多选删除
			});
		}
		selectAll.classList.remove('all_aitive');
		alertDel("删除文件成功");
		/* 右击删除 */
		menuTree.innerHTML = creatElement(data,-1,level);
		folderList.innerHTML = creatFolderList(nowId);
	}

	canelDel.addEventListener('click',function (){
		delAlert.style.display = 'none';
	});
	delClo.addEventListener('click',function (){
		delAlert.style.display = 'none';
	});
	/* 删除点击消失  */


	/* 顶部删除按钮 */
	let delBtn = document.querySelector('.operation .del');
	delBtn.addEventListener('click',function (e){
		let lis = Array.from(document.querySelectorAll('.folder_area .folder_list li'));
		let isCheck;
		lis.forEach((item)=>{
			isCheck = lis.some(item=>item.classList.contains('folder_active'));
		});
		if(!isCheck){
			alertSelect('请选择要删除的文件');
			return ;
		}
		delAlert.style.display = 'block';
	})
	/* 顶部删除按钮 */



	/* 顶部移动到 */
	let moveBtn = document.querySelector('.operation .move_to');
	moveBtn.addEventListener('click',function (e){
		let lis = Array.from(document.querySelectorAll('.folder_area .folder_list li'));
		let isCheck;
		lis.forEach((item)=>{
			isCheck = lis.some(item=>item.classList.contains('folder_active'));
		});
		if(!isCheck){
			alertSelect('请选择要移动的文件');
			return ;
		}
		moveTo.style.display = 'block';
	})
	/* 顶部删除按钮 */


	/* 右键菜单显示/隐藏 */
	function noneEl(el,el2){
		el.style.display = 'none';
		el2.style.display  = 'block';
	}
	/* 右键菜单显示/隐藏 */


	/* 文件夹区域 右键菜单显示  */
	document.addEventListener('contextmenu',function (e){
		// e.preventDefault();
	});
	folderArea.addEventListener('contextmenu',function (e){
		let x = e.clientX;
		let y = e.clientY;
		let tar = e.target;
		let lis = document.querySelector('.folder_list ul li');
		e.cancelbubble = true;
		e.preventDefault();
		if(tar.tagName == 'LI' || tar.tagName == 'IMG' || tar.tagName == 'SPAN'){
			if(tar.tagName == 'IMG' || tar.tagName == 'SPAN'){
				targetId = tar.parentNode.parentNode.dataset.id;
			}else if(tar.tagName == 'LI'){
				targetId = tar.dataset.id;
			}
			contentxMenu.style.display = 'block';
			contentxMenu.style.left = x + 'px';
			contentxMenu.style.top = y + 'px';
		}else{
			contentxMenu.style.display = 'none';
		}
	});
	
	/* 文件夹区域 右键菜单显示  */

	/* 移动到的菜单 */
	rightMenu.addEventListener('click',function (e){
		let treeList = document.querySelectorAll('.folder_area .menu_list .tree-title');
		let el = document.querySelector('.folder_area .tree-title[data-id="'+ e.target.dataset.id +'"]');
		treeList.forEach((item)=>{
			item.classList.remove('nav_active');
		});
		if(el){
			if(el.className == "tree-title"){
				el.classList.add('nav_active');
			}
		}else{
			return ;
		}
	});
	/* 移动到的菜单 */
	

	/* 左边菜单栏点击 */
	let leftMenu = document.querySelector('.menu');
	leftMenu.addEventListener('click',function (e){
		let posId = e.target.dataset.id;
		leftMenClick(e,posId);
	});
	function leftMenClick(e,posId){
		let treeList = document.querySelectorAll('.tree-title');
		let el = document.querySelector('.tree-title[data-id="'+ posId +'"]');
		treeList.forEach((item)=>{
			item.classList.remove('nav_active');
		});
		if(el){
			if(el.className == "tree-title"){
				el.classList.add('nav_active');
			}
		}else{
			return ;
		}
		let targetId = el.dataset.id;
		if(targetId){
			navList.innerHTML = nav(targetId);
			folderList.innerHTML = creatFolderList(targetId);
			nowId = targetId;
			selectAll.classList.remove('all_aitive');//移除全选状态
		}
	}
	/* 左边菜单栏点击 */
	
	
	/*新建文件夹命名检测*/
	function getName(id){
		let child = getChildsId(id);
		let names = child.map((item)=>{
			return item.title//获取子元素们的文件名
		});

		names = names.filter((item)=>{
			if(item == "新建文件夹"){
				return true;
			}
			let start = item.substr(0,6);
			let index = item.substring(6,item.length-1);
			let end = item.substring(item.length-1);
			// console.log(start,index+"i",end);
			if(start == "新建文件夹("
			&& end == ")"
			&& Number(index) > 1
			&& parseInt(index) + "" == index){
				return true;
			}
			return false;
		});
		names.sort((n1,n2)=>{
			n1 = n1=="新建文件夹"?1:n1.substring(6,n1.length-1);
			n2 = n2=="新建文件夹"?1:n2.substring(6,n2.length-1);
			return n1 - n2;
		});
		if(names[0] != "新建文件夹"){
			return "新建文件夹";
		}
		for(let i = 1; i < names.length; i++){
			if(names[i] != "新建文件夹("+(i+1)+")"){
				return "新建文件夹("+(i+1)+")";
			}
		}
		
		return "新建文件夹("+(names.length+1)+")";
	}
	/*新建文件夹命名检测*/


	/*  新建文件夹 */
	let newFile = document.querySelector('.operation .new_folder');
	let sucAlert = document.querySelector('.head .del_success');
	newFile.addEventListener('click',function (e){
		alertSuc("新建文件夹成功");
		let newDate = {
			id: Date.now(),
			pid: Number(nowId),
			title: getName(nowId)
		};
		data.push(newDate);
		folderList.innerHTML = creatFolderList(nowId);
		menuTree.innerHTML = creatElement(data,-1,level);
		rightMenu.innerHTML = creatElement(data,-1,level);
		leftMenClick(e,nowId);
	});
	function alertSuc(inner){
		sucAlert.style.display = 'block'
		sucAlert.children[1].innerHTML = inner;
		setTimeout(function (){
			sucAlert.style.display = 'none'
		},1500);
	}
	/*  新建文件夹 */



	/* 文件区域生成  */
	function creatFolderList(id){
		let childs = getChildsId(id);
		let inner = '';
		/* 判断是否有子级 加背景图片 */
		if(childs.length == 0){
			folderArea.classList.add('folder_bg');
		}else{
			folderArea.classList.remove('folder_bg');
		}
		childs.forEach((item)=>{
			inner+=`
				<li data-id="${item.id}">
                    <label class="iconfont success icon-success icon-active">
                        <input class="ipt" type="checkbox">
                    </label>

	            <div class="folder_icon">
	                <img src="images/folder.png">
				</div>

                <div class="file_name">
                	<span class="name">${item.title}</span>
                    <input type="text">
                </div>
                </li>
			`;
		});
		return inner;
	}
	folderList.innerHTML = creatFolderList(nowId);
	/* 文件区域生成  */
		

	/* 导航栏点击 */
	let navSpans = document.querySelectorAll('.nav_list span');
	navList.addEventListener('click',function (e){
		let tarSpan = e.target;
		let nowId = tarSpan.parentNode.dataset.id;
		if(tarSpan.tagName == "SPAN"){
			if(!nowId)return;
			navList.innerHTML = nav(nowId);
			folderList.innerHTML = creatFolderList(nowId);
			leftMenClick(e,nowId);
		}
	});
	/* 导航栏点击 */
	
	

	/*  文件夹点击选中 */
	let tar,inpt,dataId;
	folderArea.addEventListener('dblclick',function (e){
			filesClick(e);
	});
	folderArea.addEventListener('click',function (e){
	    tar = e.target;
	    if(tar.classList.contains("name")){
	    	inpt = tar.nextElementSibling;
			dataId = e.target.parentNode.parentNode.dataset.id;
			tar.style.display = 'none';
			inpt.style.display = 'inline-block';
			inpt.value = tar.innerHTML;
			reName(e);
	    }
		contentxMenu.style.display = 'none';//右键菜单隐藏
		sucClick(e);
	});

	/*右击重命名*/
	contMenItem[2].addEventListener('click',function (e){
		// let conTextId = getNowId(Number(targetId));
		liName = document.querySelector('.folder_list ul li[data-id="'+ targetId +'"] .file_name .name');
		inpt = document.querySelector('.folder_list ul li[data-id="'+ targetId +'"] .file_name input');
		dataId = targetId;
		liName.style.display = 'none';
		inpt.style.display = 'inline-block';
		inpt.value = liName.innerHTML;
		reName(e);
	});
	/*右击重命名*/

	/*重命名*/
	function reName(e){
			inpt.select();
			inpt.focus();
			inpt.onblur = function (){
				let new_name = inpt.value;
				let self = getNowId(dataId);//当前ID的数据
				console.log(self);
				if(renameText(dataId,new_name,nowId)){
					alertSelect("名称重复,请更改");
					return ;
				}else{
					self.title = new_name;
					folderList.innerHTML = creatFolderList(nowId);
					menuTree.innerHTML = creatElement(data,-1,0);
					tar.style.display = 'inline-block';
					inpt.style.display = 'none';
					tar.innerHTML=inpt.value;
				}
		}
	}
	/*重命名*/

	
	/*全选打勾*/
	let selectAll = document.querySelector('.select_all');
	selectAll.onmousedown = function (){
		let lis = document.querySelectorAll('.folder_list li');
		selectAll.classList.toggle('all_aitive');
		lis.forEach((item)=>{
			if(selectAll.classList.contains('all_aitive')){
				item.classList.add('folder_active');
			}else{
				item.classList.remove('folder_active');
			}
		});
	}
	/*全选打勾*/

	/*文件夹打勾*/
	function sucClick(e){
		let tar = e.target.parentNode.parentNode;
		let checkds = document.querySelectorAll('.folder_list ul li');
		if(e.target.className == 'ipt'){
			tar.classList.toggle('folder_active');
			let isCheck = document.querySelectorAll('.folder_list .folder_active');
			if(isCheck.length == checkds.length){
				selectAll.classList.add('all_aitive');
			}else{
				selectAll.classList.remove('all_aitive');
			}
		}
	}
	/*文件夹打勾*/


	/*文件夹重命名检测*/
	function renameText(id,newName,pid){
		let childs = getChildsId(pid);
		return childs.some(item=>item.title == newName && item.id != id);
	}
	/*文件夹重命名检测*/

	
	/* 双击进入文件夹 */
	function filesClick(e){
		let tar = e.target;
		console.log(tar);
		if(tar.tagName =='IMG' || tar.tagName =='SPAN'){
			tar = tar.parentNode.parentNode;
		}
		if(tar.tagName == 'LI'){
			let tarId = tar.dataset.id;
			navList.innerHTML = nav(tarId);
			folderList.innerHTML = creatFolderList(tarId);
			leftMenClick(e,tarId);
		}
	}
	/* 双击进入文件夹 */

})();