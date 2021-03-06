﻿//============== NgZorro树形表格包装器=======================
//Copyright 2019 何镇汐
//Licensed under the MIT license
//=======================================================
import { Component, Input, Output, AfterContentInit, EventEmitter } from '@angular/core';
import { remove } from "../common/helper";
import { IKey } from '../core/model';
import { Table } from './table-wrapper.component';

/**
 * NgZorro树形表格包装器
 */
@Component( {
    selector: 'nz-tree-table-wrapper',
    template: `
        <ng-content></ng-content>
    `
} )
export class TreeTable<T extends IKey> extends Table<T> {
    /**
     * 初始化树形表格包装器
     */
    constructor() {
        super();
    }

    /**
     * 获取直接下级节点列表
     * @param node 节点
     */
    getChildren( node ) {
        if ( !node )
            return [];
        return this.dataSource.filter( t => t.parentId === node.id );
    }

    /**
     * 获取所有下级节点列表
     * @param node 节点
     */
    getAllChildren( node ) {
        if ( !node )
            return [];
        let result = [];
        this.addAllChildren( result, node );
        remove( result , item => item === node );
        return result;
    }

    /**
     * 添加所有下级节点
     */
    private addAllChildren( list, node ) {
        list.push( node );
        let children = this.getChildren( node );
        children.forEach( item => this.addAllChildren( list, item ) );
    }

    /**
     * 获取上级节点
     * @param node 节点
     */
    getParent( node ) {
        if ( !node )
            return null;
        return this.dataSource.find( t => t.id === node.parentId );
    }

    /**
     * 获取所有上级节点列表
     * @param node 节点
     */
    getParents( node ) {
        let result = [];
        this.addParents( result, node );
        return result;
    }

    /**
     * 添加所有上级节点
     */
    private addParents( list, node ) {
        if ( !node )
            return;
        let parent = this.getParent( node );
        if ( !parent )
            return;
        list.push( parent );
        this.addParents( list, parent );
    }

    /**
     * 展开操作
     * @param node 节点
     * @param expand 是否展开
     */
    collapse( node, expand ) {
        if ( !node )
            return;
        node.expanded = !!expand;
    }

    /**
     * 是否叶节点
     * @param node 节点
     */
    isLeaf( node ) {
        if ( !node )
            return false;
        return node.leaf;
    }

    /**
     * 是否展开
     * @param node 节点
     */
    isExpand( node ) {
        if ( !node )
            return false;
        return node.expanded;
    }

    /**
     * 是否显示行
     * @param node 节点
     */
    isShow( node ) {
        if ( !node )
            return false;
        if ( node.level === 1 )
            return true;
        let parent = this.getParent( node );
        if ( !parent )
            return false;
        if ( !parent.expanded )
            return false;
        return this.isShow( parent );
    }

    /**
     * 行复选框切换选中状态
     * @param node 节点
     */
    rowToggle( node ) {
        this.checkedSelection.toggle( node );
        this.toggleAllChildren( node );
        this.toggleParents( node );
    }

    /**
     * 切换所有下级节点的选中状态
     */
    private toggleAllChildren( node ) {
        let isChecked = this.isSelected( node );
        let nodes = this.getAllChildren( node );
        if ( isChecked ) {
            nodes.forEach( item => this.checkedSelection.select( item ) );
            return;
        }
        nodes.forEach( item => this.checkedSelection.deselect( item ) );
    }

    /**
     * 切换所有父节点选中状态
     */
    private toggleParents( node ) {
        let parent = this.getParent( node );
        if ( !parent )
            return;
        let isAllChecked = this.isChildrenAllChecked( parent );
        if ( isAllChecked )
            this.checkedSelection.select( parent );
        else
            this.checkedSelection.deselect( parent );
        this.toggleParents( parent );
    }

    /**
     * 是否所有直接下级节点被选中
     * @param node
     */
    private isChildrenAllChecked( node ) {
        let children = this.getChildren( node );
        if ( !children || children.length === 0 )
            return false;
        return children.every( item => this.checkedSelection.isSelected( item ) );
    }

    /**
     * 行复选框的确定状态
     * @param node 节点
     */
    isRowIndeterminate( node ) {
        let children = this.getChildren( node );
        if ( !children || children.length === 0 )
            return false;
        let isChecked = children.some( item => this.checkedSelection.isSelected( item ) );
        let isAllChecked = children.every( item => this.checkedSelection.isSelected( item ) );
        return isChecked && !isAllChecked;
    }

    /**
     * 节点复选框的选中状态
     * @param node 节点
     */
    isSelected( node ) {
        return this.checkedSelection.isSelected( node );
    }
}