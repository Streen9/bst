import { Component, ElementRef, OnInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; 
@Component({
  selector: 'app-binary-main',
  templateUrl: './binary-main.component.html',
  styleUrls: ['./binary-main.component.scss'],
  encapsulation: ViewEncapsulation.None//after rendring the tree need to apply styles again
})
export class BinaryMainComponent implements OnInit {
  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;
  constructor(private http: HttpClient) {}
    root: Node | null = null;
//   root:any = {
//     "value": "50",
//     "left": {
//         "value": "30",
//         "left": {
//             "value": "22",
//             "left": null,
//             "right": null
//         },
//         "right": {
//             "value": "44",
//             "left": null,
//             "right": null
//         }
//     },
//     "right": {
//         "value": "60",
//         "left": {
//             "value": "55",
//             "left": null,
//             "right": null
//         },
//         "right": {
//             "value": "65",
//             "left": null,
//             "right": null
//         }
//     }
// }
  addEnableFlag:boolean = true
  rootFlag:boolean = false
  rootNode: any = '';
  deleteValue : any =''
  selectedTraversal:string = '';
  traversalList:string[] = []  //to sore and view the traversals
  maxLevel:number=5;  
  previousMaxLevel: number=5;
  colorBack!:string;
  // colorWhite:boolean = false
  // treeStructure: TreeNode[] = [];

  // constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.displayTree();
    this.checkLevel()
    this.getData()
    // this.setMaxLevel(); 
  }

  getData(){
   const data =  this.http.get<any>('https://bst-service.onrender.com/').subscribe((Response)=>{
    console.log(Response,'res')
    this.root = Response;
    
    this.displayTree();
    //this.maxLevel = this.countLevels(this.root);
    if(this.root == null){
      this.rootFlag = true
    }
   })
  //  console.log(data,'getting')
  }

  clearInput(){
    this.root = null
    this.rootNode= null
    this.displayTree();
    this.postIntoJson()
    this.rootFlag = true
    console.log(this.root)
  }
  displayTree() {

    //to render tree
    const treeEl = this.treeContainer.nativeElement;
    if (treeEl) {
      treeEl.innerHTML = this.renderTree(this.root);  
      // this.bindDeleteEvent(treeEl);
    }
  }
  deleteElement(value: string): void {
    console.log('deleting')
    this.root = this.deleteNode(this.root, value);
    this.displayTree();
    
  }

  // bindDeleteEvent(element: HTMLElement): void {
  //   const deleteBtns = element.querySelectorAll('.delete-btn');
  //   deleteBtns.forEach(btn => {
  //     btn.addEventListener('click', (event) => {
  //       event.stopPropagation(); // Prevent the click event
  //     });
  //   });
  // }

  removeElement(){
    if(this.root)
    this.root = this.deleteNode(this.root, this.deleteValue);
    this.postIntoJson()
    this.deleteValue = '' 
    this.displayTraversals()
    this.displayTree();
  }

  //adding the node into object with addNode function
  onSubmit(): void {
    console.log(this.rootNode,'nodes')
    const trimmedValue = this.rootNode.trim();
    if (/^-?\d+$/.test(trimmedValue)) {
      const newNode = new Node(this.rootNode);
      if (!this.root) {
        this.root = newNode;
        this.rootFlag = false;
        console.log('Root node created with value:', this.rootNode);
        this.postIntoJson()
      } else {
        this.addNode(this.root, newNode);
      }
      this.displayTree();
      this.displayTraversals()
      this.rootNode = '';
    } else {
      alert('Please enter a valid number');
    }
  }

  //delete the node

  deleteNode(root: Node | null, value: string): Node | null {
    if (!root) {
      this.displayPopup("Element not found in the tree.");
      return root;
    }
  
    // If the deleted value is smaller than the root value got to left tree
    if (value < root.value) {
      root.left = this.deleteNode(root.left, value);
    }
    // If the deleted value is larger than the root value got to right tree
    else if (value > root.value) {
      root.right = this.deleteNode(root.right, value);
    }
    // If the deleted value is  root, then this is the node to be deleted.
    else {
      // Case 1: Node to be deleted has no children (leaf node)
      if (!root.left && !root.right) {
        root = null;
      }
      // Case 2: Node to be deleted has only one child
      else if (!root.left) {
        root = root.right;
      } else if (!root.right) {
        root = root.left;
      }
      // Case 3: Node to be deleted has two children
      else {
        // Find the inorder successor (smallest value in the right subtree)
        const minValue = this.findMinValue(root.right);
        // Replace the node's value with the inorder successor value
        root.value = minValue;
        // Delete the inorder successor node recursively
        root.right = this.deleteNode(root.right, minValue);
      }
    }
  
    return root;
  }
  
  //find the minimum value in a BST
  findMinValue(root: Node | null): string {
    let minValue = root!.value;
    while (root && root.left) {
      minValue = root.left.value;
      root = root.left;
    }
    return minValue;
  }

  //find the maximum value in a BST
  findMaxValue(root: Node | null): string {
    let maxValue = root!.value;
    while (root && root.right) {
      maxValue = root.right.value;
      root = root.right;
    }
    return maxValue;
  }

  // Function to display a popup message
displayPopup(message: string): void {
  // Replace this with your own popup implementation
  alert(message);
}
  

  //To display Tree dynamically by creating string and render with html class
  renderTree(node : Node|null):any{
    if (!node) {
      return '';
    }
  
    const { value, left, right } = node;
  
    return `
      <div class="nodeElement" >${value}</div>
      ${
        left!=null || right!=null
          ? `
            <div class="nodeBottomLine"></div>
            <div class="nodeChild">
                ${left ?
                  `
                  <div class="node nodeLeft">
                    ${this.renderTree(left)}
                  </div>
                  ` : ''
                }
                ${right ?
                  `
                  <div class="node nodeRight">
                    ${this.renderTree(right)}
                  </div>
                  ` : ''
                }
            </div>
          `
          : ''
      }
    `;
  }
  // setMaxLevel(event:Event){
  //   const currentValue = parseInt((event.target as HTMLInputElement).value);
  // this.previousMaxLevel = this.maxLevel;
  // this.maxLevel = currentValue;

  // if (this.previousMaxLevel !== undefined && this.maxLevel !== undefined) {
  //   if (this.maxLevel > this.previousMaxLevel) {
  //     console.log('Value is increasing.');
  //   } else if (this.maxLevel < this.previousMaxLevel) {
  //     console.log('Value is decreasing.');
  //   } else {
  //     console.log('Value remains the same.');
  //   }
  // }
  // }

  setMaxLevel() {
    const currentLevelOfTree = this.countLevels(this.root)
    if (this.previousMaxLevel !== undefined && this.maxLevel !== undefined) {
      
      if (this.maxLevel > this.previousMaxLevel) {
        console.log('Value is increasing.');
      } 
      else if (this.maxLevel < this.previousMaxLevel) {
        if(this.maxLevel < currentLevelOfTree){
        alert('you cannot decrease the level while having the current tree')
          this.maxLevel = currentLevelOfTree
          console.log(this.maxLevel)
      }
        console.log('Value is decreasing.');
      } 
      else {
        console.log('Value remains the same.');
      }
    }
    this.previousMaxLevel = this.maxLevel;
    if(this.maxLevel >= currentLevelOfTree){
      this.addEnableFlag = true;
    }
    else{
      this.addEnableFlag = false
    }
  }
  checkFlag(event :Event){
    const checkValue = (event.target as HTMLInputElement).value;
    // this.addEnableFlag = true;
    const newNode = new Node(checkValue);
    if(this.root)
    this.checkButtonFlag(this.root, newNode)
  }

  checkButtonFlag(root: Node, newNode: Node, level: number = 1) {
    if (level >= this.maxLevel) {
      console.log('Maximum levels reached. Cannot add more nodes.');
       this.addEnableFlag = false;
      return;
    }
  
    if (parseInt(newNode.value) < parseInt(root.value)) {
      if (!root.left) {
        this.addEnableFlag = true
        //root.left = newNode;
        //console.log('Added node with value', newNode.value, 'to the left of', root.value);
      } else {
        this.checkButtonFlag(root.left, newNode, level + 1);
      }
    } else if (parseInt(newNode.value) > parseInt(root.value)) {
      if (!root.right) {
        this.addEnableFlag = true
        //root.right = newNode;
        //console.log('Added node with value', newNode.value, 'to the right of', root.value);
      } else {
        this.checkButtonFlag(root.right, newNode, level + 1);
      }
    } else {
      //console.log('Node with value', newNode.value, 'already exists.');
    }
  }


  //adding nodes to left or right
  addNode(root: Node, newNode: Node, level: number = 1) {
    if (level >= this.maxLevel) {
      // console.log('Maximum levels reached. Cannot add more nodes.');
      alert('Reached Max Level')
      // this.addEnableFlag = false;
      return;
    }
  
    if (parseInt(newNode.value) < parseInt(root.value)) {
      if (!root.left) {
        root.left = newNode;
        this.postIntoJson();
        // console.log('Added node with value', newNode.value, 'to the left of', root.value);
      } else {
        this.addNode(root.left, newNode, level + 1);
      }
    } else if (parseInt(newNode.value) > parseInt(root.value)) {
      if (!root.right) {
        root.right = newNode;
        this.postIntoJson();
        // console.log('Added node with value', newNode.value, 'to the right of', root.value);
      } else {
        this.addNode(root.right, newNode, level + 1);
      }
    } else {
      // console.log('Node with value', newNode.value, 'already exists.');
    }
  }

  postIntoJson(){
    console.log(this.root,'data')
    return this.http.post<any>('https://bst-service.onrender.com/', this.root).subscribe(Respons => {
      console.log(Respons,'res')
    })
  }
  
  


  //BST Traversals
  displayTraversals() {
    if (this.root) {
      console.log(this.root)
      //  this.printTree(this.root, 0);
      // this.treeStructure = [];
      // this.generateTreeStructure(this.root, 0, 0);
      if(this.selectedTraversal == 'inorder'){
        console.log('Inorder Traversal:');
        this.traversalList = []
        this.inorderTraversal(this.root);
        console.log(this.root);
      }
      else if(this.selectedTraversal == 'preorder'){
        console.log('Preorder Traversal:');
        this.traversalList = []
        this.preorderTraversal(this.root);
      }
      else if(this.selectedTraversal == 'postorder'){
        console.log('Postorder Traversal:');
        this.traversalList = []
        this.postorderTraversal(this.root);
      }
    } else {
      // this.treeStructure = [];
      console.log('Root node does not exist.');
    }
  }

  
//to display the tree in console
  // generateTreeStructure(node: Node | null, level: number, position: number) {
  //   if (node) {
  //     this.treeStructure.push({ value: node.value, level, position });
  //     this.generateTreeStructure(node.left, level + 1, position * 2);
  //     this.generateTreeStructure(node.right, level + 1, position * 2 + 1);
  //   }
  // }
 

  inorderTraversal(node: Node | null) {
    if (node) {
      this.inorderTraversal(node.left);
      console.log(node.value);
      this.traversalList.push(node.value)
      this.inorderTraversal(node.right);
    }
  }

  preorderTraversal(node: Node | null) {
    if (node) {
      console.log(node.value);
      this.traversalList.push(node.value)
      this.preorderTraversal(node.left);
      this.preorderTraversal(node.right);
    }
  }

  postorderTraversal(node: Node | null) {
    if (node) {
      this.postorderTraversal(node.left);
      this.postorderTraversal(node.right);
      console.log(node.value);
      this.traversalList.push(node.value)
    }
  }

  //To check the current level of tree
  checkLevel(){
    console.log('level of tree is : ',this.countLevels(this.root))
  }

  countLevels(node: Node | null, level: number = 0): number {
    if (!node) {
      return level;
    }

    const leftLevel = this.countLevels(node.left, level + 1);
    const rightLevel = this.countLevels(node.right, level + 1);

    return Math.max(leftLevel, rightLevel);
  }
}



// interface TreeNode {
//   value: string;
//   level: number;
//   position: number;
// }


//Node Structure
class Node {
  constructor(public value: string) {
    this.left = null;
    this.right = null;
  }

  left: Node | null;
  right: Node | null;
}
