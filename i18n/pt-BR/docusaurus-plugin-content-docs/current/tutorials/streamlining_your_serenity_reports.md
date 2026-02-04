---
sidebar_position: 6
---

# Tres Estrategias para Otimizar Seus Relatorios Serenity BDD

O Serenity BDD se destaca por sua capacidade de produzir relatorios detalhados e informativos. Esses relatorios oferecem insights nao apenas sobre os testes executados, mas tambem sobre o cumprimento dos requisitos de negocio. Mas como todas as ferramentas, obter o maximo do Serenity BDD envolve alguns ajustes e otimizacoes.

Aqui estao tres estrategias para tornar seus relatorios Serenity BDD mais eficientes:

1. **Mantenha-se Atualizado!**

   Certifique-se de estar trabalhando com a versao mais recente do Serenity BDD, idealmente 4.0.12 ou mais recente. A cada atualizacao, voce encontrara varias otimizacoes para melhorar o desempenho dos relatorios e minimizar os arquivos gerados. Por exemplo, a geracao de relatorios padrao na versao 4.0.11 e ate 10 vezes mais rapida do que na versao 3.9.8.

2. **Desative o Relatorio de Duracao**

   Por padrao, o Serenity BDD gera relatorios detalhados que detalham o tempo de execucao de cada teste. Embora esses relatorios sejam mais ricos em informacoes, eles consomem mais espaco em disco. Para projetos substanciais onde o espaco em disco se torna um problema, considere desativar o relatorio de duracao. Isso pode ser feito definindo a flag `serenity.report.test.durations` como false. Como prova de sua eficacia, um projeto com mais de 11.000 testes teve o tamanho de seu relatorio reduzido de 397M para 250M, e o tempo de geracao foi reduzido pela metade.

3. **Limite as Capturas de Tela a Testes com Falha**

   Ao realizar testes web, uma abordagem util para economizar espaco e capturar screenshots exclusivamente para testes com falha. Alcance isso ajustando a propriedade `serenity.take.screenshots` para FOR_FAILURES. Esse ajuste nao apenas acelera os testes, mas tambem reduz o tamanho do relatorio. Tenha em mente, no entanto, que isso pode reduzir ligeiramente o detalhe em seus relatorios.

Aproveite o poder do Serenity BDD de forma mais eficaz aplicando essas estrategias e desfrute de uma experiencia de relatorio de testes mais otimizada.
