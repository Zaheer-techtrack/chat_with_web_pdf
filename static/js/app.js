// ----------------- Genaric functions ------------------------//
// Copy text to clipboard function
function copyToClipboard(id) {

            var element = document.getElementById(id);

            // Check if the element exists
            if (element) {
                // Create a range to select the text
                var range = document.createRange();
                range.selectNode(element);

                // Clear the existing selection
                window.getSelection().removeAllRanges();

                // Add the new selection
                window.getSelection().addRange(range);

                // Execute the copy command
                document.execCommand('copy');

                // Deselect the text
                window.getSelection().removeAllRanges();

                // Optionally, provide user feedback
                // alert('Text has been copied to the clipboard: ' + element.textContent);
            } else {
                console.error('Element with ID ' + elementId + ' not found.');
            }
        }

// clear Input from model
function clearInput() {
            // Clear the input field and any error messages
            document.getElementById('inp-1').value = '';
            document.getElementById('urlErrorMessage').textContent = '';
            document.getElementById('inp-1').classList.remove('is-invalid');
        }

// Form validate function

function validateForm() {
    var fileInput = document.getElementById('inp-1');
    var urlErrorMessage = document.getElementById('urlErrorMessage');
    if (fileInput.type === 'file'){

        // Check if a file has been selected
        if (fileInput.files.length === 0) {
            urlErrorMessage.textContent = 'Please select a file.';
            fileInput.classList.add('is-invalid');
            return false;
        } else {
            urlErrorMessage.textContent = '';
            fileInput.classList.remove('is-invalid');
        }

        // Add more validation if needed

        return true;
    }else{
            // Implement your form validation logic here
            var urlInput = document.getElementById('inp-1').value;
            if (urlInput.trim() === '') {
                urlErrorMessage.textContent = 'Please enter a valid URL.';
                document.getElementById('inp-1').classList.add('is-invalid');
                return false;
            } else {
                urlErrorMessage.textContent = '';
                document.getElementById('inp-1').classList.remove('is-invalid');
            }

            // Add more validation if needed

            return true;
    }


        }

// Validate INPUT Function

function validateInput() {
    var btn = document.getElementById('up-btn');
    var urlInput = document.getElementById('inp-1');
    var urlErrorMessage = document.getElementById('urlErrorMessage');
    if (urlInput.type === 'url'){
        var inputvalue = urlInput.value;
        // Use a regular expression to validate the URL
        var urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        if (!urlPattern.test(inputvalue)) {
                urlErrorMessage.textContent = 'Please enter a valid URL.';
                document.getElementById('inp-1').classList.add('is-invalid')
                btn.disabled = true;
                return false;
            } else {
                urlErrorMessage.textContent = '';
                document.getElementById('inp-1').classList.remove('is-invalid');
                btn.disabled = false;
            }
        return true;
    }else if(urlInput.type === 'file'){
            if (urlInput.files.length === 0) {
                urlErrorMessage.textContent = 'Please choose a PDF file.';
                urlInput.classList.add('is-invalid');
                btn.disabled = true;
                return false;
            }
            if (urlInput.files[0].type !== 'application/pdf') {
                urlErrorMessage.textContent = 'Please choose a valid PDF file.';
                urlInput.classList.add('is-invalid');
                btn.disabled = true;
                return false;
            } else {
                urlErrorMessage.textContent = '';
                urlInput.classList.remove('is-invalid');
                btn.disabled = false;
            }
            return true;
    }

        }

// Form Submit Function

function submitForm() {
            // Validate the form before submitting
            if (validateForm()) {
                var fileInput = document.getElementById('inp-1');
                if (fileInput.type === 'file'){
                    upload();
                }else if (fileInput.type === 'url'){
                    web();
                }
                clearInput();
                $('#file-upload-modal').modal('hide');
            }
        }

// Chat history

function chat_history(type = 'pdf') {

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
            var chatHistory = document.getElementById("chat-list-1");
            chatHistory.innerHTML =
                chatArr
                    .map(function (a) {
                        var b = JSON.parse(localStorage.getItem(a))[0];
                        var file_name = b.file_name;
                        return (
                            "<li>" +
                            "<button class='list-item list_item_" + a + "' type='button' key='" +
                            a + "' onclick=\"loadChat('" + a + "', '" +
                                type+
                            "')\">" +
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

// Generate Random Hexa or ID

function generateRandomHex(length) {
            let result = "";
            const characters = "0123456789ABCDEF";

            for (let i = 0; i < length; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );
            }

            return result;
        }

// Update upload state function

function updateUploadState(file_hash, type = 'pdf') {

            var uploadDetails = document.getElementById("summary");
            var pdf = document.getElementById("pdf");
            var embedElement = document.createElement("embed");
            var response = JSON.parse(localStorage.getItem(file_hash));
            console.log(response);
            uploadDetails.innerHTML = "<div class='summery-wrapper'>" +
                "<p>" +
                response[0].summary +
                "</p>" +
                "<h5>Some questions you may ask</h5>" +
                "<ul class='suggested-list'>" +
                response[0].question
                    .map(function (value) {
                        var b = generateRandomHex(6);
                        return ("<li>" +
                            "<button role='none' type='button' onclick=\"chat2('" +
                            b +
                            "','" +
                            type+
                            "')\" id='" +
                            b +
                            "'>" +
                            "<span id='" + b +
                            "-span'>" +
                            value +
                            "</span>" +
                            "</button> </li>");
                    }).join('') +
                "</ul>" +
                "</div>";
            document.getElementById('source-name').innerHTML = response[0].file_name;
            document.getElementById('source-ref').innerHTML = response[0].file_name;


            if (type === 'html') {

                embedElement.type = "text/html";
                embedElement.src = response[0].file_name;
            } else {

                embedElement.type = "application/pdf";
                embedElement.src = "/uploads/" + response[0].file_hash + '.pdf';
            }

            embedElement.style.height = "100%";
            embedElement.style.width = "100%";
            pdf.innerHTML = embedElement.outerHTML;
            document.getElementById("chat-form").style.display = "block";
            document.getElementById("file_hash").value = response[0].file_hash;
            document.getElementById("chat-list").innerHTML = "";
            chat_history(type);
        }

// Load content on Page load

function onLoadContent() {
            var typeDoc = document.getElementById('page').value;
            var summary = 'The document appears to be titled "What is Artificial Intelligence?" and was created using Microsoft PowerPoint 2016. The PDF document contains information about the information flow between the "human" and "machine" components of a system. It emphasizes the importance of understanding the capabilities and flexibilities of both components. The document also includes illustrations and references to external resources for further information. The document has a total of 71 pages.';
            var questions = ['What is the importance of understanding the capabilities and flexibilities of both the "human" and "machine" components in a system?', 'How does the information flow between the "human" and "machine" components in a typical system?', 'What external resources are available for further information on the topic of information flow in systems?'];
            var chat = {
                "what this document is about?": 'The document is titled "What is Artificial Intelligence?" and it provides information about the concept of artificial intelligence.',
                "What is the relationship between artificial intelligence and the concept of information flow in systems?": 'The relationship between artificial intelligence and the concept of information flow in systems is discussed on the following pages in the PDF document:<br><br>1. Page 8: The illustration on this page shows a typical information flow between the "human" and "machine" components of a system. It emphasizes the importance of understanding the capabilities and flexibilities of both components.<br><br>2. Page 59: This page explains that for an agent to be "intelligent," it must be able to understand the meaning of information. Information is exchanged in messages and must be conveyed in a selected representation language. The receiver must have the ability to interpret the information correctly according to the intended meaning or semantics.'
            };
            var uploadDetails = document.getElementById("summary");
            uploadDetails.innerHTML = "<div class='summery-wrapper'>" +
                "<p>" +
                summary +
                "</p>" +
                "<h5>Some questions you may ask</h5>" +
                "<ul class=\"suggested-list\">" +
                questions
                    .map(function (value) {
                        var b = generateRandomHex(6);
                        return ("<li>" +
                            "<button role='none' type='button' onclick=\"chat2('" +
                            b +
                            "', '" +
                            typeDoc+
                            "')\" id='" +
                            b +
                            "'>" +
                            "<span id='" +
                            b +
                            "-span'>" +
                            value +
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
                        "<img src='/static/icons/chat-gpt.svg' alt='gpt'>" +
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


        }

// ----------------------- Web Specific Function -------------------------- //

// upload Websit URL

function web() {
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
                            type: 'html',
                            time: Math.floor(new Date().getTime() / 1000)
                        });
                        localStorage.setItem(
                            response.file_hash,
                            JSON.stringify(valuesArray)
                        );
                        updateUploadState(response.file_hash, type = 'html');
                        chat_history('html');
                        addActiveClass();
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

// Chat with HTML

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
                // const eventSource = new EventSource(`/stream/stream_${file_hash}`);
                // eventSource.onmessage = function (event) {
                //     alert(event.data)
                    // Handle the incoming data (event.data)

                // };

                // eventSource.onerror = function (error) {
                //     alert(error.type)
                //     console.error('EventSource failed:', error);
                //     eventSource.close();
                //     hideLoader();
                // };

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
                        "<img src='/static/icons/chat-gpt.svg' alt='gpt'>" +
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
                chat_history('html');
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
                        "<img src='/static/icons/chat-gpt.svg' alt='gpt'>"  +
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
              chat_history(doc);
              hideLoader();
            } else {
              console.table("Error: " + queryRequest.status);
              hideLoader();
            }
          }
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
                        "<img src='/static/icons/chat-gpt.svg' alt='gpt'>"  +
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
        chat_history(type);
         addActiveClass();
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


        function upload() {
            var fileInput = document.getElementById("inp-1");
            var file = fileInput.files[0];

            if (!file) {
                alert("Please select a file");
                return;
            }

            var formData = new FormData();
            formData.append("file", file);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/chat", true);
            showLoader();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
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
                            type: "pdf",
                            time: Math.floor(new Date().getTime() / 1000),
                        });
                        localStorage.setItem(
                            response.file_hash,
                            JSON.stringify(valuesArray)
                        );
                        updateUploadState(response.file_hash,'pdf');
                        chat_history('pdf');
                        addActiveClass();
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

        function chat() {
            showLoader();
            var file_hash = document.getElementById("file_hash").value;
            var query = document.getElementById("queryInput").value;
            var localstoragedata = JSON.parse(localStorage.getItem(file_hash));
            localstoragedata[0].chat[query] = "......";
            localStorage.setItem(file_hash, JSON.stringify(localstoragedata));
            var keyArr = Object.keys(
                JSON.parse(localStorage.getItem(file_hash))[0].chat
            );
            c = keyArr.join("-->  ");
            var queryRequest = new XMLHttpRequest();
            queryRequest.open("POST", "/api/chat/" + file_hash, true);
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
                                    "</p><p class='values' id='" +
                                    valuetext +
                                    "' onclick='copyToClipboard(\"" +
                                    valuetext +
                                    "\")'>" +
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



        window.onload = function () {
            onLoadContent();
            var mode = document.getElementById('page').value;
            chat_history(mode);
        };

        function showLoader() {
            document.getElementById("loader").style.display = "flex";
        }

        // Function to hide loader
        function hideLoader() {
            document.getElementById("loader").style.display = "none";
        }

        $("document").ready(function () {
            let vh = window.innerHeight * 0.01;

        });

        // small functions for page
        $(".mobile-pdf-show-btn").click(function () {
            $(this).toggleClass("active");
            $("#col-2").toggleClass("active");
        });
        $(".wrapp-btn").click(function () {
            $(this).toggleClass("active");
            $(".sidebar-wrapper").toggleClass("active");
        });

        if (window.innerWidth < 767) {
            $(".wrapp-btn").addClass("active");
            $(".sidebar-wrapper").addClass("active");
        }
        $(window).resize(function () {
            if (window.innerWidth < 767) {
                $(".wrapp-btn").addClass("active");
                $(".sidebar-wrapper").addClass("active");
            }

            let vh = window.innerHeight * 0.01;
            $(":root").css("--vh", `${vh}px`);
        });
        $(".heading-wrapper").click(function () {
            $(this).toggleClass("active");
            $(".chat-inner-wrapper").toggleClass("active");
        });
        $(".fa-pen-to-square").click(function () {
            var inputElement = $(this).parent().siblings('input[type="text"]');
            inputElement.prop("readonly", false);
            $(this).parent(".action-div").addClass("active");
            $(this).parent().siblings(".edit-div").addClass("active");
        });

        $(".scan-modal-btn").click(function () {
            $(".scan-modal-wrapper").addClass("active");
            $(".empty-bg-wrapper").addClass("show");
        });
        $(".close-modal-btn").click(function () {
            $(".scan-modal-wrapper").removeClass("active");
            $(".empty-bg-wrapper").removeClass("show");
        });

//--------------------------------- Chat with PDF specific-------------------------------//

// chat with pdf function

function chat() {
        showLoader();
        var file_hash = document.getElementById("file_hash").value;
        var query = document.getElementById("queryInput").value;
        var localstoragedata = JSON.parse(localStorage.getItem(file_hash));
        localstoragedata[0].chat[query] = "......";
        localStorage.setItem(file_hash, JSON.stringify(localstoragedata));
        var keyArr = Object.keys(
          JSON.parse(localStorage.getItem(file_hash))[0].chat
        );
        c = keyArr.join("-->  ");
        var queryRequest = new XMLHttpRequest();
        queryRequest.open("POST", "/api/chat/" + file_hash, true);
        queryRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
                        "<img src='/static/icons/chat-gpt.svg' alt='gpt'>" +
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
              chat_history('pdf');
              hideLoader();
            } else {
              console.table("Error: " + queryRequest.status);
              hideLoader();
            }
          }
        };
        queryRequest.send("query=" + c);
      }

document.getElementById('queryInput').ente