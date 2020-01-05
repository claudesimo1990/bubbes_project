<!DOCTYPE>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Bubbles</title>

    <!-- JavaScript Libraries //-->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- CSS Style //-->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link href="css/scrolling-nav.css" rel="stylesheet" type="text/css">
</head>
<style>
    path:hover {

        fill: #007bff;
    }

    .tooltip {
        background: #eee;
        box-shadow: 0 0 5px #999999;
        color: #333;
        font-size: 12px;
        left: 130px;
        padding: 10px;
        position: absolute;
        text-align: center;
        top: 95px;
        z-index: 10;
        display: block;
        opacity: 0;
    }

    .footer-classic a, .footer-classic a:focus, .footer-classic a:active {
        color: #ffffff;
    }

    .logo {
        position: absolute;
        top: 0;
        left: 40px;
        padding-top: 20px;
        font-size: 30px;
    }

    .nav-list li {
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .nav-list li a:hover:before {
        margin-left: 0;
        opacity: 1;
        visibility: visible;
    }

    ul, ol {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .social-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 23px;
        font: 900 13px/1 "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.5);
    }

    .social-container .col {
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .nav-list li a:before {
        content: "\f14f";
        font: 400 21px/1 "Material Design Icons";
        color: #4d6de6;
        display: inline-block;
        vertical-align: baseline;
        margin-left: -28px;
        margin-right: 7px;
        opacity: 0;
        visibility: hidden;
        transition: .22s ease;
    }

    a {
        text-decoration: none;
        color: #333333;
    }
</style>

<body>
<div class="container" style="margin-bottom: 5%">
    <a href="index.html">
        <div class="logo">
            BU<span style="color:#007bff">BB</span>LES
        </div>
    </a>
    <div class="agb" style="margin-top: 10%;width: 100%;height: 100%">

        <div class="jumbotron jumbotron-fluid">
            <div class="container">
                <h1 class="display-3" style="color: #7db169;padding-bottom: 4%"><?= $_POST["name"]; ?></h1>
                <p class="lead"><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A adipisci fugit natus nulla provident quibusdam quo. Ab alias beatae dolore hic, iusto modi necessitatibus porro, provident quae quia unde vel.</span>
                    <span>Eos quas quod ut? Commodi consequatur cupiditate dignissimos eum illum neque omnis quibusdam quis, sapiente? Ad aspernatur expedita harum nam nesciunt non nostrum optio recusandae sapiente sed sequi similique, veritatis?</span>
                </p>
                <p class="lead"><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A adipisci fugit natus nulla provident quibusdam quo. Ab alias beatae dolore hic, iusto modi necessitatibus porro, provident quae quia unde vel.</span>
                    <span>Eos quas quod ut? Commodi consequatur cupiditate dignissimos eum illum neque omnis quibusdam quis, sapiente? Ad aspernatur expedita harum nam nesciunt non nostrum optio recusandae sapiente sed sequi similique, veritatis?</span>
                </p>
                <p class="lead"><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A adipisci fugit natus nulla provident quibusdam quo. Ab alias beatae dolore hic, iusto modi necessitatibus porro, provident quae quia unde vel.</span>
                    <span>Eos quas quod ut? Commodi consequatur cupiditate dignissimos eum illum neque omnis quibusdam quis, sapiente? Ad aspernatur expedita harum nam nesciunt non nostrum optio recusandae sapiente sed sequi similique, veritatis?</span>
                </p>
            </div>
        </div>

    </div>
</div>
<footer class="section footer-classic context-dark bg-image" style="background:rgb(56, 123, 177)">
    <div class="row no-gutters">
        <div class="col">
            <a class="social-inner" href="impressum.html"><span>Impressum</span></a>
        </div>
        <div class="col">
            <a class="social-inner" href="datenschutz.html"><span>Datenschutz</span></a>
        </div>
        <div class="col">
            <a class="social-inner" data-toggle="modal" data-target="#exampleModal" data-whatever="@getbootstrap"><span>Kontakt</span></a>
        </div>
        <div class="col"><a class="social-inner" href="agb.html"><span>AGB</span></a>
        </div>
    </div>
</footer>
<script src="js/bubbles.js"></script>
</body>
</html>