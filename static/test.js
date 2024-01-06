function chat2web(b) {
        showLoader();
    var file_hash = document.getElementById("file_hash").value;
    var query = document.getElementById(b).innerText;
    var localstoragedata = JSON.parse(localStorage.getItem(file_hash));
        localstoragedata[0].chat[query] = "......";
        localStorage.setItem(file_hash, JSON.stringify(localstoragedata));
        var keyArr = Object.keys(
          JSON.parse(localStorage.getItem(file_hash))[0].chat
        );
        c = keyArr.join("-->  ");
        var queryRequest = new XMLHttpRequest();
        queryRequest.open("POST", "/api/chat/web/url/" + file_hash, true);
        queryRequest.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
        queryRequest.onreadystatechange = function () {
          if (queryRequest.readyState == 4) {
            if (queryRequest.status == 200) {
              var response = JSON.parse(queryRequest.responseText);
              var locadata = JSON.parse(localStorage.getItem(file_hash));
              locadata[0].chat[query] = response.response;
              localStorage.setItem(file_hash, JSON.stringify(locadata));
              kvArr = JSON.parse(localStorage.getItem(file_hash))[0].chat;
              var chatlist = document.getElementById("chat-list");
              chatlist.innerHTML = Object.entries(kvArr)
                .map(function ([k, v]) {
                    var valuetext = generateRandomHex(9);
                  return (
                    "<p class='keys'>" +
                    k +
                    "</p><p class='values' id='" + valuetext + "' onclick='copyToClipboard(\"" + valuetext + "\")'>"+
                    v +
                    "</p>"
                  );
                })
                .join("");
              console.log("response" + response.response);

              // Call saveToLocalStorage after each request

              document.getElementById("queryInput").value = "";
              chat_history();
              hideLoader();
            } else {
              console.table("Error: " + queryRequest.status);
              hideLoader();
            }
          }
        };
        queryRequest.send("query=" + c);
      }

/////////////
// Load chat history

function chat_history(type='pdf') {

        var chatArr1 = Object.keys(localStorage);
        var chatArr = [];
        chatArr1.forEach(function (key) {
        var chatData = JSON.parse(localStorage.getItem(key));

            if (chatData[0].type === type) {
                chatArr.push(key);
            }
        });
        chatArr.sort(function (a, b) {
        var timestampA = JSON.parse(localStorage.getItem(a))[0].time;
        var timestampB = JSON.parse(localStorage.getItem(b))[0].time;

        return timestampA - timestampB;
        });
        var chatHistory = document.getElementById("chat-list");
        chatHistory.innerHTML =
          chatArr
            .map(function (a) {
              var b = JSON.parse(localStorage.getItem(a))[0];
              var file_name = b.file_name;
              return (
                "<li>" +
                "<button class='list-item list_item_" + a + "' type='button' key='" + a + "' onclick=\"loadChat('" + a + "', 'html')\">" +
                "<i class=\"fa-solid fa-square\"></i>" +
                "<input type='text' readonly value='" + file_name + "'>" +
                "<div class=\"action-div\">" +
                "<i class=\"fa-regular fa-pen-to-square\"></i>" +
                "<i class=\"fa-solid fa-trash-can\"></i>" +
                "</div>" +
                "<div class=\"edit-div\">" +
                "<i class=\"fa-solid fa-check\"></i>" +
                "<i class=\"fa-solid fa-xmark\"></i>" +
                "</div>" +
                "</button>" +
                "</li>"
              );
            })
            .join("");

      }

function web(){
    var fileInput = document.getElementById("inp-1");
        var file = fileInput.value;

        if (!file || file.trim() === '') {
          alert("Please Paste a URL");
          return;
        }

        var formData = new FormData();
        formData.append("url", file);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/chat/web/url", true);
        showLoader();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              //

              //
              var response = JSON.parse(xhr.responseText);
              var existingValues = localStorage.getItem(response.file_hash);
              var valuesArray = existingValues ? JSON.parse(response) : [];
              var chatArray = {};
              valuesArray.push({
                file_hash: response.file_hash,
                file_name: response.file_name,
                summary: response.summary,
                question: response.question,
                chat: chatArray,
                type:'html',
                time: Math.floor(new Date().getTime() / 1000)
              });
              localStorage.setItem(
                response.file_hash,
                JSON.stringify(valuesArray)
              );
              updateUploadState(response.file_hash, type='html');
              chat_history('html');
              hideLoader();
            } else {
              // Request failed, handle the error here
              console.error("Error:", xhr.status, xhr.statusText);
              hideLoader();
            }
          }
        };

        xhr.send(formData);

}

// Update upload state

 function updateUploadState(file_hash,type='pdf') {

        var uploadDetails = document.getElementById("summary");
        var pdf = document.getElementById("pdf");
        var embedElement = document.createElement("embed");
        var response = JSON.parse(localStorage.getItem(file_hash));
        console.log(response);
        uploadDetails.innerHTML = "<div class='summery-wrapper'>" +
            "<p>" +
            response[0].summary+
            "</p>" +
            "<h5>Some questions you may ask</h5>" +
            "<ul class='suggested-list'>" +
            response[0].question
                .map(function (value){
                    var b = generateRandomHex(6);
                    return ("<li>" +
                        "<button role='none' type='button' onclick='chat2(" +
                        b+
                        "', 'html')\" id='" +
                        b+
                        "'>" +
                        "<span id='" +b+
                        "-span'>" +
                        value+
                        "</span>" +
                        "</button> </li>");
                }).join('')+
            "</ul>" +
            "</div>";
        document.getElementById('source-name').innerHTML = response[0].file_name
        document.getElementById('source-ref').innerHTML = response[0].file_name


        if (type === 'html'){

            embedElement.type = "text/html";
            embedElement.src = response[0].file_name;
        }
        else {

         embedElement.type = "application/pdf";
         embedElement.src = "/uploads/" + response[0].file_hash+'.pdf';
        }

        embedElement.style.height = "100%";
        embedElement.style.width = "100%";
        pdf.innerHTML = embedElement.outerHTML;
        document.getElementById("chat-form").style.display = "block";
        document.getElementById("file_hash").value = response[0].file_hash;
        document.getElementById("chat-list").innerHTML = "";
        chat_history(type='html');
      }

// load content on page load
function onLoadContent(){

          var summary = 'The document appears to be titled "What is Artificial Intelligence?" and was created using Microsoft PowerPoint 2016. The PDF document contains information about the information flow between the "human" and "machine" components of a system. It emphasizes the importance of understanding the capabilities and flexibilities of both components. The document also includes illustrations and references to external resources for further information. The document has a total of 71 pages.';
          var questions = ['What is the importance of understanding the capabilities and flexibilities of both the "human" and "machine" components in a system?','How does the information flow between the "human" and "machine" components in a typical system?','What external resources are available for further information on the topic of information flow in systems?'];
          var chat = {"what this document is about?":'The document is titled "What is Artificial Intelligence?" and it provides information about the concept of artificial intelligence.',
          "What is the relationship between artificial intelligence and the concept of information flow in systems?":'The relationship between artificial intelligence and the concept of information flow in systems is discussed on the following pages in the PDF document:<br><br>1. Page 8: The illustration on this page shows a typical information flow between the "human" and "machine" components of a system. It emphasizes the importance of understanding the capabilities and flexibilities of both components.<br><br>2. Page 59: This page explains that for an agent to be "intelligent," it must be able to understand the meaning of information. Information is exchanged in messages and must be conveyed in a selected representation language. The receiver must have the ability to interpret the information correctly according to the intended meaning or semantics.'
          };
          var uploadDetails = document.getElementById("summary");
          uploadDetails.innerHTML = "<div class='summery-wrapper'>" +
              "<p>" +
              summary+
              "</p>" +
              "<h5>Some questions you may ask</h5>" +
              "<ul class='suggested-list'>" +
              questions
                  .map(function (value){
                      var b = generateRandomHex(6);
                      return ("<li>" +
                          "<button role='none' type='button' onclick=\"chat2('" +
                          b+
                         "', 'html')\" id='" +
                          b+
                          "'>" +
                          "<span id='" +
                          b+
                          "-span'>" +
                          value+
                          "</span></button>" +
                          "</li>");
                  }).join('') +
              "</ul>" +
              "</div>";

          var chatlist = document.getElementById("chat-list");
          chatlist.innerHTML = Object.entries(chat)
              .map(function ([k, v]) {
                  var valuetext = generateRandomHex(9);
            return (
                "<div class='keys'>" +
                "<div class='img-wrapper'>" +
                "<img src=\"{{ url_for('static', filename='images/profile.jpg') }}\" alt=\"\"/>" +
                "</div>" +
                "<div class='content-wrapper'>" +
                "<div class=\"chat-inner-wrapper\">" +
                "<p>" +
                    k+
                "</p>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "<div class='values' id='" +
                    valuetext+
                "'>" +
                "<div class='img-wrapper'>" +
                "<img src=\"{{ url_for('static', filename='icons/chat-gpt.svg') }}\" alt=\"\"/>" +
                "</div>" +
                "<div class='content-wrapper'>" +
                "<div class=\"chat-inner-wrapper\">" +
                "<p>" +
                    v+
                "</p>" +
                "</div>" +

                "<div class='more-action-wrapper'>" +
                "<div class='summery-action-warpper'>" +
                "<ul>" +
                "<li>" +
                "<span class='copy-icon' onclick=\"copyToClipboard('" +
                    valuetext+
                "')\">" +
                "<i class='fa-regular fa-thumbs-up' tabindex='0' data-bs-toggle='tooltip' data-bs-title='Disabled tooltip'></i>" +
                "</span>" +
                "</li>" +
                "<li>" +
                "<span class='copy-icon' onclick=\"copyToClipboard('" +
                    valuetext+
                "')\">" +
                "<i class=\"fa-regular fa-thumbs-down\"></i>" +
                "</span>" +
                "</li>" +
                "<li>" +
                "<span class='copy-icon' onclick=\"copyToClipboard('" +
                    valuetext+
                "')\">" +
                "<i class='fa-solid fa-arrow-up-from-bracket'></i>" +
                "</span>" +
                "</li>" +
                "<li>" +
                "<span class='copy-icon' onclick=\"copyToClipboard('" +
                    valuetext+
                "')\">" +
                "<i class='fa-solid fa-copy'></i>" +
                "</span>" +
                "</li>" +
                "</ul>" +
                "</div>" +
                "<div class=\"drop-down-wrapper\">" +
                "<div class='dropdown'>" +
                "<span type='button' class='btn dropdown-toggle btn-sm' data-bs-toggle='dropdown' aria-expanded='false'>" +
                "<i class=\"fa-regular fa-gem\"></i> Enrich" +
                "</span>" +
                "<ul class='dropdown-menu'>" +
                "<li>" +
                "<a class='dropdown-item' href='#'>" +
                "<span>translate</span>" +
                "<i class='fa-solid fa-circle-chevron-right'></i>" +
                "</a>" +
                "</li>" +
                "<li>" +
                "<a class='dropdown-item' href='#'>" +
                "<span>Auto enrich full text</span>" +
                "</a>" +
                "</li>" +
                "</ul>" +
                "</div>" +
                "</div>" +
                "</div>" +
                    "</div>" +
                "</div> "
    );
}).join("");


      }

function html_chat() {
    showLoader();
    var file_hash = document.getElementById("file_hash").value;
    var query = document.getElementById("queryInput").value;
    var localstoragedata = JSON.parse(localStorage.getItem(file_hash));
    localstoragedata[0].chat[query] = "......";
    localStorage.setItem(file_hash, JSON.stringify(localstoragedata));
    var keyArr = Object.keys(JSON.parse(localStorage.getItem(file_hash))[0].chat);
    c = keyArr.join("-->  ");
    var queryRequest = new XMLHttpRequest();
    queryRequest.open("POST", "/api/chat/web/url/" + file_hash, true);
    queryRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    queryRequest.onreadystatechange = function () {
        if (queryRequest.readyState == 4) {
            if (queryRequest.status == 200) {
                // Connect to the specific SSE endpoint for this conversation
                const eventSource = new EventSource(`/stream/stream_${file_hash}`);
                eventSource.onmessage = function (event) {
                    alert(event.data)
                    // Handle the incoming data (event.data)

                };

                eventSource.onerror = function (error) {
                    alert(error.type)
                    console.error('EventSource failed:', error);
                    eventSource.close();
                    hideLoader();
                };

                var response = JSON.parse(queryRequest.responseText);
                var locadata = JSON.parse(localStorage.getItem(file_hash));
                locadata[0].chat[query] = response.response;
                localStorage.setItem(file_hash, JSON.stringify(locadata));
                kvArr = JSON.parse(localStorage.getItem(file_hash))[0].chat;
                var chatlist = document.getElementById("chat-list");
                chatlist.innerHTML = Object.entries(kvArr)
                .map(function ([k, v]) {

                    var valuetext = generateRandomHex(9);
                    return (
                        "<div class='keys'>" +
                        "<div class=\"img-wrapper\">" +
                        "<img src=\"{{ url_for('static', filename='images/profile.jpg') }}\" alt=\"\"/>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class='chat-inner-wrapper'>" +
                        "<p>" +
                        k +
                        "</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='values' id='" +
                        valuetext +
                        "'>" +
                        "<div class='img-wrapper'>" +
                        "<img src=\"{{ url_for('static', filename='icons/chat-gpt.svg') }}\" alt=''/>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class=\"chat-inner-wrapper\">" +
                        "<p>" +
                        v +
                        "</p>" +
                        "</div>" +


                        "<div class='more-action-wrapper'>" +
                        "<div class='summery-action-warpper'>" +
                        "<ul>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-regular fa-thumbs-up' tabindex='0' data-bs-toggle='tooltip' data-bs-title='Disabled tooltip'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class=\"fa-regular fa-thumbs-down\"></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-arrow-up-from-bracket'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-copy'></i>" +
                        "</span>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "<div class=\"drop-down-wrapper\">" +
                        "<div class='dropdown'>" +
                        "<span type='button' class='btn dropdown-toggle btn-sm' data-bs-toggle='dropdown' aria-expanded='false'>" +
                        "<i class=\"fa-regular fa-gem\"></i> Enrich" +
                        "</span>" +
                        "<ul class='dropdown-menu'>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>translate</span>" +
                        "<i class='fa-solid fa-circle-chevron-right'></i>" +
                        "</a>" +
                        "</li>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>Auto enrich full text</span>" +
                        "</a>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div> "
                    );
                }).join("");
                console.log("response -> " + response.response);

                // Call saveToLocalStorage after each request

                document.getElementById("queryInput").value = "";
                chat_history();
                hideLoader();
            } else {
                console.table("Error: " + queryRequest.status);
                hideLoader();
            }
        }
    };
    queryRequest.onerror = function () {
        hideLoader();
    };
    queryRequest.send("query=" + c);
}



// load chat from chat id

 function loadChat(a, type='pdf') {


        var response = JSON.parse(localStorage.getItem(a))[0];
        updateUploadState(response.file_hash, type);
        var chatlist = document.getElementById("chat-list");
        chatlist.innerHTML = Object.entries(response.chat)
          .map(function ([k, v]) {
              var valuetext = generateRandomHex(9);
            return (
                        "<div class='keys'>" +
                        "<div class=\"img-wrapper\">" +
                        "<i class='fa-regular fa-circle-user'></i>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class='chat-inner-wrapper'>" +
                        "<p>" +
                        k +
                        "</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='values' id='" +
                        valuetext +
                        "'>" +
                        "<div class='img-wrapper'>" +
                        "<img src=\"{{ url_for('static', filename='icons/chat-gpt.svg') }}\" alt=''/>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class=\"chat-inner-wrapper\">" +
                        "<p>" +
                        v +
                        "</p>" +
                        "</div>" +


                        "<div class='more-action-wrapper'>" +
                        "<div class='summery-action-warpper'>" +
                        "<ul>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-regular fa-thumbs-up' tabindex='0' data-bs-toggle='tooltip' data-bs-title='Disabled tooltip'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class=\"fa-regular fa-thumbs-down\"></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-arrow-up-from-bracket'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-copy'></i>" +
                        "</span>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "<div class=\"drop-down-wrapper\">" +
                        "<div class='dropdown'>" +
                        "<span type='button' class='btn dropdown-toggle btn-sm' data-bs-toggle='dropdown' aria-expanded='false'>" +
                        "<i class=\"fa-regular fa-gem\"></i> Enrich" +
                        "</span>" +
                        "<ul class='dropdown-menu'>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>translate</span>" +
                        "<i class='fa-solid fa-circle-chevron-right'></i>" +
                        "</a>" +
                        "</li>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>Auto enrich full text</span>" +
                        "</a>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div> "
                    );
          })
          .join("");
         addActiveClass()
      }

function addActiveClass() {
    var hash = document.getElementById('file_hash').value;
    var historyButton = document.querySelector('button[key="' + hash + '"]');

    if (historyButton) {
         historyButton.classList.add('active');

    } else {
        console.table('Button not found');
    }
}

// chat2()

function chat2(b,doc='pdf') {
        showLoader();
        var file_hash = document.getElementById("file_hash").value;
        var query = document.getElementById(b).innerText;
        var localstoragedata = JSON.parse(localStorage.getItem(file_hash));
        localstoragedata[0].chat[query] = "......";
        localStorage.setItem(file_hash, JSON.stringify(localstoragedata));
        var keyArr = Object.keys(
          JSON.parse(localStorage.getItem(file_hash))[0].chat
        );
        c = keyArr.join("-->  ");
        var queryRequest = new XMLHttpRequest();
        if (doc === 'html'){
            queryRequest.open("POST", "/api/chat/web/url/" + file_hash, true);
        }else{
            queryRequest.open("POST", "/api/chat/" + file_hash, true);
        }
        queryRequest.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
        queryRequest.onreadystatechange = function () {
          if (queryRequest.readyState == 4) {
            if (queryRequest.status == 200) {
              var response = JSON.parse(queryRequest.responseText);
              var locadata = JSON.parse(localStorage.getItem(file_hash));
              locadata[0].chat[query] = response.response;
              localStorage.setItem(file_hash, JSON.stringify(locadata));
              kvArr = JSON.parse(localStorage.getItem(file_hash))[0].chat;
              var chatlist = document.getElementById("chat-list");
              chatlist.innerHTML = Object.entries(kvArr)
                    .map(function ([k, v]) {
                    var valuetext = generateRandomHex(9);
                    return (
                        "<div class='keys'>" +
                        "<div class=\"img-wrapper\">" +
                        "<i class='fa-regular fa-circle-user'></i>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class='chat-inner-wrapper'>" +
                        "<p>" +
                        k +
                        "</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='values' id='" +
                        valuetext +
                        "'>" +
                        "<div class='img-wrapper'>" +
                        "<img src=\"{{ url_for('static', filename='icons/chat-gpt.svg') }}\" alt=''/>" +
                        "</div>" +
                        "<div class='content-wrapper'>" +
                        "<div class=\"chat-inner-wrapper\">" +
                        "<p>" +
                        v +
                        "</p>" +
                        "</div>" +
                        "<div class='more-action-wrapper'>" +
                        "<div class='summery-action-warpper'>" +
                        "<ul>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-regular fa-thumbs-up' tabindex='0' data-bs-toggle='tooltip' data-bs-title='Disabled tooltip'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class=\"fa-regular fa-thumbs-down\"></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-arrow-up-from-bracket'></i>" +
                        "</span>" +
                        "</li>" +
                        "<li>" +
                        "<span class='copy-icon' onclick=\"copyToClipboard('" +
                        valuetext +
                        "')\">" +
                        "<i class='fa-solid fa-copy'></i>" +
                        "</span>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "<div class=\"drop-down-wrapper\">" +
                        "<div class='dropdown'>" +
                        "<span type='button' class='btn dropdown-toggle btn-sm' data-bs-toggle='dropdown' aria-expanded='false'>" +
                        "<i class=\"fa-regular fa-gem\"></i> Enrich" +
                        "</span>" +
                        "<ul class='dropdown-menu'>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>translate</span>" +
                        "<i class='fa-solid fa-circle-chevron-right'></i>" +
                        "</a>" +
                        "</li>" +
                        "<li>" +
                        "<a class='dropdown-item' href='#'>" +
                        "<span>Auto enrich full text</span>" +
                        "</a>" +
                        "</li>" +
                        "</ul>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div> "
                    );
                }).join("");
              console.log("response" + response.response);

              // Call saveToLocalStorage after each request

              document.getElementById("queryInput").value = "";
              chat_history();
              hideLoader();
            } else {
              console.table("Error: " + queryRequest.status);
              hideLoader();
            }
          }
        };
        queryRequest.send("query=" + c);
      }
