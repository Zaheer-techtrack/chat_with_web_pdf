from flask import Flask, request, jsonify,render_template, url_for, session, send_from_directory, Response, stream_with_context

import os, random, string, datetime, logging, sys, re, requests
from langchain.document_loaders import PDFPlumberLoader, BSHTMLLoader
from langchain.vectorstores import Chroma,FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain.agents.agent_toolkits import create_retriever_tool, create_conversational_retrieval_agent
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
app.secret_key = 'your_secret_key'
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
model_name = os.environ.get('model_name')

def generate_random_hex_name(length=16):
    return ''.join(random.choice(string.hexdigits) for _ in range(length))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

def removeNumberFromStart(text=''):
    text= text.strip()
    result = re.sub('\d+\.\s*', '',text)
    return result

def delete_old_files(directory_path=os.path.join(os.getcwd(),'uploads')):
    # Get the current time
    current_time = datetime.datetime.now()

    # Iterate over files in the directory
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)

        # Check if the path is a file and not a directory
        if os.path.isfile(file_path):
            # Get the modification time of the file
            modification_time = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))

            # Calculate the time difference
            time_difference = current_time - modification_time

            # Check if the file is older than or equal to 4 hours
            if time_difference.total_seconds() >= 10 * 86400:
                try:
                    # Delete the file
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # filename = filename+'.pdf'
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/chat', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        delete_old_files()
        # Manual file upload form
        file = request.files['file']
        if file and allowed_file(file.filename):
            file_hash = generate_random_hex_name()
            file.save(os.path.join('uploads', f"{file_hash}.pdf"))
            file_path = os.path.join(os.getcwd(), 'uploads', f"{file_hash}.pdf")
            origional_name = file.filename
            # return jsonify({"path":file_path,"hash_name":file_hash, "name":origional_name})
            try:
                llm = ChatOpenAI(model_name=model_name, temperature=0.7, streaming=True)
                loader = PDFPlumberLoader(file_path)
                pages = loader.load_and_split()
                embeddings = OpenAIEmbeddings()
                db = FAISS.from_documents(pages, embeddings)

                retriever = db.as_retriever()

                tool = create_retriever_tool(
                    retriever=retriever,
                    name="pdf_document",
                    description="Detailed about this document"
                )
                tools = [tool]
                agent_executer = create_conversational_retrieval_agent(llm=llm, tools=tools, verbose=True, memory_key='', handle_parsing_errors=True)
                print(f'\n\n db data\n {agent_executer}\n\n')
                result = agent_executer({"input":"write short summary of this pdf document."})
                summary = result["output"]

                result = agent_executer({"input": "write top 3 question from this pdf document."})
                questions = result["output"]

                questions = questions.split('\n')
                questions = [removeNumberFromStart(x) for x in questions if x]
                return jsonify({"file_hash":file_hash,"file_name":origional_name, "summary":summary,"question":questions,"error":""})
                # return render_template('home.html', file_hash=file_hash, summary=summary, questions=questions)
            except Exception as e:
                return jsonify({"file_hash":file_hash,"file_name":origional_name, "summary":"","question":"", "error":e})
                # return render_template('home.html',error='PDF has no text or has Image Data.')

    return render_template('home.html')


@app.route('/api/chat/<hash_name>', methods=['POST'])
def chat_with_pdf(hash_name):
    if request.method == 'POST':
        print('-->1')
        embeddings = OpenAIEmbeddings()
        print('-->2')
        llm = ChatOpenAI(model_name=model_name, temperature=0.7, streaming=True)
        print('-->3')
        conversation_context = {'documents': None, 'last_query': None}

        # Define keywords that indicate a follow-up question
        follow_up_keywords = ['what is my name', 'who am i', 'tell me about me']
        # Initialize conversation_context as an empty list if it doesn't exist in the session


        if os.path.exists(os.path.join(os.getcwd(), 'uploads', f"{hash_name}.pdf")):
            print('-->4')
            file_path = os.path.join(os.getcwd(), 'uploads', f"{hash_name}.pdf")
            print(f'file path is {file_path}')

            loader = PDFPlumberLoader(file_path)
            documents = loader.load_and_split()
            print(documents)
            # sys.exit()
            db = FAISS.from_documents(documents, embeddings)


            retriever = db.as_retriever()

            tool = create_retriever_tool(
                retriever=retriever,
                name="pdf_document",
                description="Detailed about this document"
            )
            tools = [tool]
            agent_executer = create_conversational_retrieval_agent(llm=llm, tools=tools, verbose=True, memory_key='', handle_parsing_errors=True)
            print(f'\n\n db data\n {agent_executer}\n\n')
            # sys.exit()
            # chain = load_qa_chain(ChatOpenAI(model_name=model_name, temperature=0), chain_type="stuff")
            # docs = retriever.get_relevant_documents('Total number of pages in this documents')

            # Get the relevant documents based on the user's query
            query = request.form.get('query')
            print(query)
            if query.strip() != '':
                query = 'tell me from in this pdf document '+ query
            queryList = query.split("-->  ")
            print(f'query is {query}')
            # output = chain.run(input_documents=docs, question=query)
            for a in queryList:
                format = 'the answer format should be like this at page 1 it is mentioned. if first page index start from 0 then consider page start from 1 now '
                a = format + 'tell me from in this pdf ' + a
                print(a)
                result = agent_executer({"input":a})
            # result = agent_executer({"input":query})
            output = result["output"]
            if '\n' in output:
                output = output.replace('\n','<br>')


            # Render the result template with the query response
            return jsonify({'result': hash_name, 'query': query, 'response': output})

@app.route('/api/chat/web/url',methods=['GET','POST'])
def web_loader():
    if request.method == 'POST':
        url = request.form.get('url','')
        url = url.strip()
        if url.strip() == '':
            return jsonify({"error":"no url provided"})
        path, file_hash = saveHtml(url)
        embeddings = OpenAIEmbeddings()
        llm = ChatOpenAI(model_name=model_name, temperature=0.7, streaming=True)
        loader = BSHTMLLoader(path)
        documents = loader.load_and_split()
        db = FAISS.from_documents(documents, embeddings)

        retriever = db.as_retriever()

        tool = create_retriever_tool(
            retriever=retriever,
            name="web_document",
            description="Detailed about this document"
        )
        tools = [tool]
        agent_executer = create_conversational_retrieval_agent(llm=llm, tools=tools, verbose=True, memory_key='', handle_parsing_errors=True)
        result = agent_executer({"input": "write short summary of this web document."})
        summary = result["output"]

        result = agent_executer({"input": "write top 3 question from this web document."})
        questions = result["output"]

        questions = questions.split('\n')
        questions = [removeNumberFromStart(x) for x in questions if x]
        return jsonify({"file_hash": file_hash, "file_name": url, "summary": summary, "question": questions,
                        "error": ""})
    else:
        return render_template('web.html')


@app.route('/api/chat/web/url/<hash_name>', methods=['POST'])
def chat_with_web(hash_name):
    if request.method == 'POST':
        embeddings = OpenAIEmbeddings()
        llm = ChatOpenAI(model_name=model_name, temperature=0.7, streaming=True)

        if os.path.exists(os.path.join(os.getcwd(), 'uploads', f"{hash_name}.html")):
            file_path = os.path.join(os.getcwd(), 'uploads', f"{hash_name}.html")

            loader = BSHTMLLoader(file_path)
            documents = loader.load_and_split()

            db = FAISS.from_documents(documents, embeddings)

            retriever = db.as_retriever()

            tool = create_retriever_tool(
                retriever=retriever,
                name="web_document",
                description="Detailed about this document"
            )
            tools = [tool]
            agent_executer = create_conversational_retrieval_agent(llm=llm, tools=tools, handle_parsing_errors=True)

            query = request.form.get('query')
            if query.strip() != '':
                queryList = query.split("-->  ")

                result = agent_executer({"input": queryList})
                output = result["output"]
                if '\n' in output:
                    output = output.replace('\n', '<br>')

                return jsonify({'result': hash_name, 'query': query, 'response': output})

    return jsonify({'error': 'Invalid request'})
@app.route('/')
def home():
    return render_template('demo.html')

@app.route('/testing')
def my_str():
    chat = ChatOpenAI()
    def streaming():
        chats = chat.stream("Write me a song about goldfish on the moon")
        for chunk in chats:
            yield chunk.content
    return Response(stream_with_context(streaming()), content_type="text/event-stream")

def saveHtml(url):
    response = requests.get(url)
    if response.status_code == 200:
        html_name = generate_random_hex_name()
        path = os.path.join(os.getcwd(),'uploads',f'{html_name}.html')
        with open(path, "w", encoding="utf-8") as file:
            file.write(response.text)
        return path, html_name

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9090)
