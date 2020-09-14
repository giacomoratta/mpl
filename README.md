<section id="whatis">
<p>
    SAMM is a command line based software which helps and preserve your creativity flow. Dive into your wide samples library, make researches, extract random samples and save them into the current project directory.
</p>
<blockquote>In a couple of minutes... ask for samples, import in your project directory, use them!</blockquote>
</section>


<section id="principles">
<h2>Principles</h2>
<ol>
    <li><strong>Save your creativity flow.</strong> SAMM avoid you wasting your time dealing with hundred of samples inside many nested directories. Just ask.</li>
    <li><strong>Improve your creativity with randomness.</strong> SAMM does not care about how you organize your samples. MPL selects samples randomly based on simple human-readable queries. (It will be funny to find some <i>old-but-good</i> samples or weird samples which you would have never chosen).</li>
    <li><strong>Easy, fast and light interface to avoid CPU and RAM wastefulness</strong>. Don't be afraid about the command line and let's save CPU and RAM for the DAW.</li>
</ol>
</section>


<section id="download-and-install">
<h2>Download and install</h2>
<ol>
    <li>Download the zip package and extract.</li>
    <li>Copy the directory <code>samm.0.1.0.win-x64</code> in your software or documents directory.</li>
    <li>Add the absolute path of this directory to your PATH environment variable (see <a href="#appendix-a">Appendix A</a>)</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>
</section>


<section id="get-started">
<h2>Get started</h2>
Simple steps you need to start using SAMM in few minutes; to do more see <a href="#reference">all commands reference</a>.
After the <a href="#download-and-install">preliminary steps</a>, you should be able to run the command <code>samm</code>.

<h4>1. Essential config</h4>
<p>The only thing you need is to set the samples directory: <code>config SamplesDirectory "/home/user123/my samples dir/"</code> (" included)</p>
<p>Curious about all the configuration parameters? The command <code>config</code> shows all the parameters, their descriptions and the current value.</p>
<p>Hint: if you start typing <code>config Sampl</code>, press TAB and you will get the auto-completion.</p>

<h4>2. First sample scan</h4>
<p>In order to be able to run a search, all your samples need to be indexed; this process is important to avoid wasting pc resources and slow searches.</p>
<p>Run <code>samples-scan</code> and wait some seconds.</p>
<p>If you need to re-index, run <code>samples-scan -f</code> (-f means 'force')</p>

<h4>3. Set current project</h4>
<p>Where will the samples be imported? Inside your project directory!</p>
<p>So, get the full path of your current project and run the command <code>project "/home/user123/music-projects/project1"</code> (" included)</p>

<h4>4. Look and export</h4>
<p>Finally, everything is ready to search and import samples!</p>
<p>I guess all of us have some kicks, right? So, run <code>look kick</code>.</p>
<p>The result should be a short and random list of 'kick' samples. If you run again, you will get a different list!</p>
<p>Last step is to import these samples into your project; run <code>look-export</code> or <code>look-export kick-set1</code> (for a custom directory name), and answer 'y'.</p>
<p>Now, go back to your project, focus on this small sub-set of samples, and try to use them!</p>

<h4>5. Set and use queries for look</h4>
<p>For a more complex results, you need to write a query.</p>
<p>This application just uses human readable queries: comma (,) is OR and plus (+) is AND. Let's see some examples:</p>
<ul>
    <li><code>look kick,kick+dark,kc+raw</code> = all samples inside a full path which contains the words 'kick', OR 'kick' and 'dark', OR 'kc' AND 'raw'.</li>
    <li><code>look bass+moog,bass+303</code> = all samples inside a full path which contains the words 'bass' AND 'moog', OR 'bass' AND '303'.</li>
</ul>
<p><a href="#appendix-c---how-queries-works">See Appendix B, for more details about queries</a></p>

<h4>6. Switch the project</h4>
<p>If you want to switch to another project in the same directory (e.g. /home/user123/music-projects/), run <code>project-list</code></p>
<p>If you want to switch to a previous project, run <code>project-history</code></p>

<h4>7. Tune the sample scan</h4>
<p>Do you want more random samples?</p>
<p>Do you want to exclude some extensions or include only specific ones?</p>
<p>Do you want to exclude some directories?</p>
<p>Check the command <code>config</code> inside the Reference section.</p>

</section>

<section id="reference">
<h2>Commands reference</h2>

<h4>config</h4>
<table>
 <thead>
    <td></td>
 </thead>
</table>
<p>
    <strong>SamplesDirectory</strong>: directory with samples to scan and search in (absolute path). <br/>
    <code>config SamplesDirectory "/home/user123/my-samples/"</code>
</p>
<p>
    <strong>LookRandomCount</strong>:  maximum number of random samples selected after a search. <br/>
    <code>config LookRandomCount 15</code>
</p>
<p>
    <strong>LookRandomSameDirectory</strong>: mMaximum number of samples from the same directory, to avoid too many samples from the same family. <br/>
    <code>config LookRandomSameDirectory 2</code>
</p>

<h4>bookm</h4>
<h4>bookm-export</h4>
<h4>bookm-look</h4>
<h4>look</h4>
<h4>look-export</h4>
<h4>project</h4>
<h4>project-history</h4>
<h4>project-list</h4>
<h4>project-template</h4>
<h4>query</h4>
<h4>sample-scan</h4>
<h4>search</h4>
</section>


<section id="appendix-a">
<h2>Appendix A - How to add a path to PATH environment variable</h2>
The following steps will show how to install this software in order to be run in your terminal with the simple command <code>samm</code>.

<h4>Windows</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.win-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>C://Programs//samm.0.1.0.win-x64</code>.</li>
    <li>Go to <strong>System Properties</strong>, click the Advanced tab, and then click Environment Variables..</li>
    <li>In the <strong>System Variables</strong> section, highlight Path, and click Edit.</li>
    <li>In the Edit System Variables window, insert the cursor at the end of the Variable value field.</li>
    <li>If the path contains spaces, wrap it with double quotes, e.g. <code>"C://Program Data//samm.0.1.0.win-x64"</code>.</li>
    <li>If the last character is not a semi-colon (;), add one.</li>
    <li>After the final semi-colon, type the absolute path (e.g. <code>C://Programs//samm.0.1.0.win-x64</code>).</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>

<h4>Mac</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.mac-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Edit the file <code>/etc/paths</code> in admin mode, e.g. <code>sudo nano /etc/paths</code>.</li>
    <li>Add the absolute path at the end of this file, so new line with <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Save the changes.</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>

<h4>Linux</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.linux-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>/home/user123/software/samm.0.1.0.linux-x64</code>.</li>
    <li>Edit the file <code>.bashrc</code> in your home: e.g. <code>nano ~/.bashrc</code>.</li>
    <li>Add the following line at the end: <code>PATH=$PATH:the-absolute-path</code>, e.g. <code>PATH=$PATH:/home/user123/software/samm.0.1.0.linux-x64</code>.</li>
    <li>If the path contains spaces, wrap it with double quotes, e.g. <code>"/home/user123/music software/samm.0.1.0.linux-x64"</code>.</li>
    <li>Save the changes.</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>
</section>


<section id="appendix-c---how-queries-works">
<h4>Appendix B - How queries works</h4>
<p>This section is for who has never used a command line interface.</p>
<ol>
    <li>Path with spaces: always wrap it in double quotes otherwise only the first part will be considered; e.g. <code>"C://Program Data//samm.0.1.0.win-x64"</code>.</li>
</ol>
</section>
