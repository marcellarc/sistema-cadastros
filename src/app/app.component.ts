//import dos módulos necessários
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; //para criar e validar formulários
import { NgIf } from '@angular/common'; //para exibir e esconder elementos
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'; //para máscara no cep e cpf
import { HttpClientModule, HttpClient } from '@angular/common/http'; //para chamar a api cep

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgxMaskDirective, NgxMaskPipe, HttpClientModule],
  providers: [provideNgxMask()],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  formulario!: FormGroup; //form nunca será nulo
  dadosUsuario: any = null; //quaisquer dados inseridos pelo usuário, inicia como null
  endereco: any = null; //endereço obtido pela api, inicia como null
  exibirTabela: boolean = false; //controla a exibição da tabela
  idade: number = 0; //idade obtida através de cálculo

  constructor(private fb: FormBuilder, private http: HttpClient) { //instanciando os serviços formbuilder e httpclient
    this.formulario = this.fb.group({ //inicializando formulario com método group() para criar os campos necessários
      nome: ['', [Validators.required, Validators.maxLength(150), Validators.pattern('^[A-Za-zÀ-ÖØ-öø-ÿ ]+$')]], //apenas letras permitidas
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], //formato com 11 números
      dataNascimento: ['', [Validators.required]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]] //formato com 8 números
    });
  }

  enviar() {
    // verifica se o formulário é válido
    if (this.formulario.valid) {
      this.dadosUsuario = this.formulario.value; //os valores do formulario sao armazenados no dadosUsuario
      console.log('Formulário enviado:', this.dadosUsuario); 

      this.idade = this.calcularIdade(this.dadosUsuario.dataNascimento); //calcula a idade com base na data de nascimento informada pelo usuário

      // buscar o endereço de acordo com o cep digitado pelo usuário com a api viacep
      this.buscarEndereco(this.dadosUsuario.cep); 

      this.exibirTabela = true; //tabela será exibida, seu valor mudou para true
    } else {
      console.log('Formulário inválido!');
    }
  }

  calcularIdade(dataNascimento: string): number { //método que recebe a data de nascimento para calcular a idade
    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataNasc.getMonth();
    const diaAtual = hoje.getDate();
    const diaNascimento = dataNasc.getDate();

    //verificação se já fez aniversário esse ano
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--;
    }
    return idade;
  }

  buscarEndereco(cep: string) { //método para buscar o endereço recebendo o cep digitado pelo usuário
    //a api irá retornar os dados do endereço
    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe(
      (response: any) => { //quando a resposta é processada, os dados sao armazenados na variável endereco
        this.endereco = response;
        console.log('Endereço encontrado:', this.endereco);
      },
      (error) => {
        console.log('Erro ao buscar o endereço:', error);
      }
    );
  }
}
