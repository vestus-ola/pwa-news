const sourceSelector = document.querySelector('#sourceSelector');
let defaultSource = 'abc-news';
const apiKey = '808190cc907b400d9c2035f8ba6512c4';
const main = document.querySelector('main');
const pageSize = 15;
let isLoading = true;
let page = 1;
let maxPage = 6;
let articleArray = [];

addEventListener('load', async () => {
  getNewsFromSources();
  await updateSelectSource();

  sourceSelector.addEventListener('change', function  (e) {
    articleArray = [];
    isLoading = true;
    document.getElementById('loader').style.display = 'block';
    document.getElementById('loading-end').style.display = 'none';
    $('#main-data').empty();
    defaultSource = e.target.value;
    page = 1;
    getNewsFromSources(e.target.value);
  })

  if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
      console.log("[PWA Builder] active service worker found, no need to register");
    } else {
      // Register the service worker
      navigator.serviceWorker
          .register("sw.js", {
            scope: "./"
          })
          .then(function (reg) {
            console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
          });
    }
  }
});

async function getNewsFromSources(src = defaultSource, page = null, pageSize = 15) {
  try {
    const res = await fetch(`https://newsapi.org/v2/everything?language=en&sortBy=publishedAt&sources=${src}&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`)
    const json = await res.json();
    articleArray.push(json.articles)
    if (articleArray.length > 0) {
      $('#main-data').append(convertToArticleFormat(articleArray[articleArray.length - 1]));
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function updateSelectSource() {
  try {
    const res = await fetch(`https://newsapi.org/v2/sources?language=en&country=us&apiKey=${apiKey}`);
    const json = await res.json();
    if (json.sources) {
      sourceSelector.innerHTML = json.sources.map(res => `<option value="${res.id}">${res.name}</option>`).join('\n')
    }
  } catch (error) {
    console.log(error.message);
  }
}

function convertToArticleFormat(article) {
  var res = '';
  if (article.length > 0) {
    article.forEach(function (value, k) {
      if ((k + 1) % 3 === 0) {
        res += `
                  <div class="col-md-4">
                      <div class="card card-default">
                          <div class="card-body">
                              <h4><a href="${value.url}" class="text-center">${value.title}</a></h4>
                          </div>
                          <div class="card-footer">
                              <h6><i class="glyphicon glyphicon-user"></i> ${value.author === null ? 'Anonymous' : value.author}</h6>
                          </div>
                      </div>
                  </div>
                  <div class="clearfix"></div>
              `;
      } else {
        res += `<div class="col-md-4">
                  <div class="card card-default">
                    <div class="card-body">
                        <h4><a href="${value.url}" class="text-center">${value.title}</a></h4>
                    </div>
                    <div class="card-footer">
                        <h6><i class="glyphicon glyphicon-user"></i> ${value.author === null ? 'Anonymous' : value.author}</h6>
                    </div>
                </div>
            </div>`;
      }
    });
    document.getElementById('loader').style.display = 'none';
    isLoading = false;
  } else {
    document.getElementById('loader').style.display = 'none'
    isLoading = false;
  }
  return res;
}

addEventListener('scroll', scrollPageToBottom);

function scrollPageToBottom() {
  var scrollHeight = document.body.scrollHeight;
  var scrollPosition = window.scrollY + window.innerHeight;
  if ((((scrollHeight - scrollPosition) > 200) &&  ((scrollHeight - scrollPosition) <= 1200)) && !isLoading) {
    document.getElementById('loader').style.display = 'block';
    isLoading = true;
    var incPage = page + 1;
    page = incPage;
    if (page > maxPage) {
      isLoading = false;
      document.getElementById('loader').style.display = 'none';
      document.getElementById('loading-end').style.display = 'block';
    } else {
      getNewsFromSources(defaultSource, page, pageSize);
      document.getElementById('loading-end').style.display = 'none';
    }
  }
}