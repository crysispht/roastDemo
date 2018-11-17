<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link href="{{ asset('css/app.css') }}" rel="stylesheet" type="text/css"/>

    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <title>Roast</title>
    <script src="https://webapi.amap.com/maps?v=1.4.10&key=10dc8f591cf134c366cde9a6eb384d89"></script>

    <script type='text/javascript'>
        @php
            echo 'window.Laravel = '. json_encode(['csrfToken' => csrf_token(),]);
        @endphp
    </script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-128359684-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'UA-128359684-1');
    </script>

    <script src="//{{ Request::getHost() }}:6001/socket.io/socket.io.js"></script>

</head>
<body>
<div id="app">
    <router-view></router-view>
</div>
<script type="text/javascript" src="{{ asset('js/app.js') }}"></script>
</body>
</html>
