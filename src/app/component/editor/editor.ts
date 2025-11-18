import { Component, ElementRef} from '@angular/core';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { WebsocketProvider } from 'y-websocket';
import { EditorState,Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { Ai } from '../../services/ai'
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor {
    roomId='';
  private view! : EditorView;

  constructor( 
    private route:ActivatedRoute,
    private ai: Ai ,
    private el: ElementRef
  ){ }

  ngAfterViewInit():void{
    this.roomId= this.route.snapshot.queryParamMap.get('room') ?? 'default';

    //YJS Document
    const yDoc =new Y.Doc();

    const provider = new WebsocketProvider(
      'ws://localhost:1234',// Backend Web socket
      this.roomId,
      yDoc
    );

    const yText = yDoc.getText('codemirror');

    //AI Completion source

    const aiCompletion = autocompletion({
      override:[
        async (context) => {
          const doc = context.state.doc.toString();
          const offset = context.pos;

          const response : any = await this.ai.getCompletion(doc,offset).toPromise();
          console.log(response.completion);
          const text = response.completion || " ";
          const suggestions = [{
            label:text.substring(0,30),
            text: text,
          }]
          return{
            from : context.pos,
            options : suggestions.map((s:any)=>({
              label:s.label,
              type:'keyword',
              apply:s.text
            }))
          };
        }
      ]
    });

    //Editor Setup
    this.view = new EditorView({
      state: EditorState.create({
        doc:'',
        extensions :[
          basicSetup,
          javascript(),
          yCollab(yText, provider.awareness),
          aiCompletion
        ] as Extension[]
      }),
      parent : this.el.nativeElement.querySelector('#editor')
    })
  }

}
